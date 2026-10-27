import numpy as np, math
from PIL import Image
from scipy import ndimage as nd

def crotch(m):
    h,w=m.shape
    # scan from bottom 10% up; find highest row with two leg runs separated by a gap
    best=None
    for y in range(int(h*0.92), int(h*0.45), -1):
        xs=np.where(m[y])[0]
        if len(xs)==0: continue
        runs=np.split(xs,np.where(np.diff(xs)>1)[0]+1)
        runs=[r for r in runs if len(r)>=int(w*0.06)]
        if len(runs)>=2:
            # biggest gap between consecutive big runs
            gaps=[(runs[i+1][0]-runs[i][-1], (runs[i][-1]+runs[i+1][0])/2) for i in range(len(runs)-1)]
            g=max(gaps)
            best=(y,g[1])
        else:
            if best and y < best[0]-3: break
    return best

def leg_angle(piece_mask, pivot):
    ys,xs=np.where(piece_mask)
    sel=ys>ys.max()-max(6,(ys.max()-ys.min())*0.12)
    fx,fy=xs[sel].mean(), ys[sel].mean()
    return math.degrees(math.atan2(fx-pivot[0], fy-pivot[1])), (fx,fy)

def rot_piece(img, pivot, deg, shift=(0,0)):
    # rotate RGBA image about pivot (x,y) by deg (positive = foot moves toward +x), output same canvas
    im=Image.fromarray(img)
    # PIL rotate: positive angle = counterclockwise. foot below pivot moving toward +x means counterclockwise.
    out=im.rotate(deg, resample=Image.BICUBIC, center=pivot, translate=shift)
    return np.array(out)

def build_walk(frame_img, n=8, amp=22, lift_frac=0.04, pad=0.5, occ=None):
    import cv2
    a=frame_img.copy()
    top=np.zeros_like(a)
    if occ is not None:
        occ=nd.binary_fill_holes(nd.binary_closing(occ,iterations=2)) & (a[...,3]>8)
        top[occ]=a[occ]
        body=(a[...,3]>8)&~occ
        sil=nd.binary_fill_holes(nd.binary_closing(body,structure=np.ones((3,3)),iterations=8))
        fill=(occ&sil).astype(np.uint8)
        rgb=cv2.inpaint(np.ascontiguousarray(a[...,:3]), fill, 6, cv2.INPAINT_TELEA)
        a[...,:3]=np.where(fill[...,None]>0, rgb, a[...,:3]); a[...,3]=np.where(occ&~sil,0,a[...,3])
    m=frame_img[...,3]>8
    h,w=m.shape
    cy,cx=crotch(m)
    cut=int(cy - h*0.07)              # leg cut line, hidden under jacket hem
    pivot=(cx, cy - h*0.10)           # hip pivot
    # big canvas so rotations don't clip
    P=int(h*pad); H2,W2=h+2*P, w+2*P
    def canvas(arr):
        c=np.zeros((H2,W2,4),np.uint8); c[P:P+h,P:P+w]=arr; return c
    up=a.copy(); up[cut:]=0
    ov=int(h*0.09)
    back=a.copy(); back[:cut-ov]=0; back[:, int(cx):]=0
    front=a.copy(); front[:cut-ov]=0; front[:, :int(cx)]=0
    def keep_main(piece):
        mm=piece[...,3]>8; lab,n=nd.label(mm,structure=np.ones((3,3)))
        if n<=1: return piece, np.zeros_like(piece)
        sz=nd.sum(mm,lab,range(1,n+1)); main=1+int(np.argmax(sz))
        rest=piece.copy(); rest[lab==main]=0; piece=piece.copy(); piece[(lab!=main)]=0
        return piece, rest
    for pc in (back,front):
        pc[cut-ov:cut, :int(cx-w*0.2)]=0; pc[cut-ov:cut, int(cx+w*0.2):]=0
    back,rb=keep_main(back); front,rf=keep_main(front)
    # stray bits below the cut return to the static upper body
    for rest in (rb,rf):
        sel=rest[...,3]>0; sel[:cut]=False; up[sel]=rest[sel]
    pelvis=a.copy(); pelvis[:cut]=0; pelvis[int(cut+h*0.06):]=0; pelvis[:, :int(cx-w*0.13)]=0; pelvis[:, int(cx+w*0.13):]=0
    piv=(pivot[0]+P, pivot[1]+P)
    up,back,front,pelvis,top=canvas(up),canvas(back),canvas(front),canvas(pelvis),canvas(top)
    ab,_=leg_angle(back[...,3]>8,piv); af,_=leg_angle(front[...,3]>8,piv)
    A = amp if amp is not None else (af-ab)/2
    frames=[]; legs_l=[]
    for k in range(n):
        ph=2*math.pi*k/n
        tf=A*math.cos(ph); tb=-A*math.cos(ph)
        # swing leg: front leg swings forward when sin(ph)<0 (angle increasing); lift it
        lf=max(0,-math.sin(ph))*lift_frac*h; lb=max(0,math.sin(ph))*lift_frac*h
        F=rot_piece(front,piv,tf-af,(0,-lf)); B=rot_piece(back,piv,tb-ab,(0,-lb))
        comp=Image.new('RGBA',(W2,H2),(0,0,0,0))
        for layer in (pelvis,B,F,up,top): comp.alpha_composite(Image.fromarray(layer))
        legs=Image.new('RGBA',(W2,H2),(0,0,0,0))
        for layer in (pelvis,B,F): legs.alpha_composite(Image.fromarray(layer))
        frames.append(np.array(comp)); legs_l.append(np.array(legs))
    return frames, dict(crotch=(cx+P,cy+P),cut=cut+P,pivot=piv,A=A,af=af,ab=ab,P=P,legs=legs_l,up=up,top=top,size=(W2,H2))

def melee_walk(punch_img, melee_img, occ, n=8):
    from PIL import Image
    fr,pi=build_walk(punch_img,n=n)
    h_p=punch_img.shape[0]; h_m=melee_img.shape[0]
    s=h_p/h_m
    mi=Image.fromarray(melee_img); mi=mi.resize((round(melee_img.shape[1]*s),round(h_m*s)),Image.LANCZOS)
    om=Image.fromarray((occ*255).astype(np.uint8)).resize(mi.size,Image.NEAREST)
    ma=np.array(mi); oc=np.array(om)>127
    m=ma[...,3]>8; hh,ww=m.shape
    cy,cx=crotch(m&~oc) or crotch(m)
    cut=int(cy-hh*0.07)
    upper=ma.copy(); upper[cut:]=0
    top=np.zeros_like(ma); top[oc]=ma[oc]
    # place so melee crotch matches punch crotch (both in canvas coords)
    W2,H2=pi['size']; ox=int(round(pi['crotch'][0]-cx)); oy=int(round(pi['crotch'][1]-cy))
    def place(arr):
        c=np.zeros((H2,W2,4),np.uint8); c[oy:oy+hh,ox:ox+ww]=arr; return c
    U,T=place(upper),place(top)
    out=[]
    for k in range(n):
        comp=Image.fromarray(pi['legs'][k].copy())
        for layer in (U,T): comp.alpha_composite(Image.fromarray(layer))
        out.append(np.array(comp))
    return out, dict(scale=s, offset=(ox,oy))
