import numpy as np, json, frames, rig
from PIL import Image
from batmask import batmask
SRC='/mnt/user-data/uploads/Zed_Idler/assets/wandering-characters/'
rp,_=frames.frames(SRC+'survivor-walk-punch-v3.png')
rm,_=frames.frames(SRC+'survivor-melee-swing-v3.png')
def bbox(a):
    m=a[...,3]>8; ys=np.where(m.any(1))[0]; xs=np.where(m.any(0))[0]; return xs.min(),ys.min(),xs.max()+1,ys.max()+1
def build(kind):
    items=[]  # (img RGBA, x_left in common coords) ; baseline aligned later
    if kind=='punch':
        walk,info=rig.build_walk(rp[0]['img']); P=info['P']
        for f in walk:
            x0,y0,x1,y1=bbox(f); items.append((f[y0:y1,x0:x1], x0-P))   # coords relative to source frame left
        base_cellx=rp[0]['cellx']
        for f in rp[8:]:
            items.append((f['img'], f['cellx']-base_cellx))
    else:
        walk,info=rig.melee_walk(rp[0]['img'],rm[0]['img'],batmask(rm[0]['img']))
        _,pinfo=rig.build_walk(rp[0]['img']); P=pinfo['P']
        for f in walk:
            x0,y0,x1,y1=bbox(f); items.append((f[y0:y1,x0:x1], x0-P))
        s=info['scale']; ox=info['offset'][0]-P; base=rm[0]['cellx']
        for f in rm[8:]:
            k = s if f['cell'][0]==2 else s*1.08/0.951*0.951  # row 3 drawn ~8% smaller than the walk rows
            k = 0.99*1.0 if f['cell'][0]==2 else 1.08
            im=Image.fromarray(f['img']); w,h=im.size
            im=im.resize((round(w*k),round(h*k)),Image.LANCZOS)
            # keep the frame's horizontal centre where the artist placed it
            cxm=(f['cellx']-base)*s + ox + w*s/2
            items.append((np.array(im), cxm - im.size[0]/2))
    return items
def pack(items, cell_h=300, pad=0.03):
    xs0=min(x for _,x in items); xs1=max(x+a.shape[1] for a,x in items); hmax=max(a.shape[0] for a,_ in items)
    W=xs1-xs0; H=hmax
    CW=int(W*(1+2*pad)); CH=int(H*(1+pad*2))
    sheet=Image.new('RGBA',(CW*4,CH*4),(0,0,0,0))
    base=int(CH*(1-pad))
    for i,(a,x) in enumerate(items):
        r,c=divmod(i,4)
        sheet.alpha_composite(Image.fromarray(a),(int(c*CW+CW*pad+(x-xs0)), r*CH+base-a.shape[0]))
    scale=cell_h/CH
    out=sheet.resize((round(CW*scale)*4, cell_h*4), Image.LANCZOS)
    walk_h=max(items[i][0].shape[0] for i in range(8))
    stand_h=min(items[i][0].shape[0] for i in range(8))
    return out, dict(cellW=round(CW*scale), cellH=cell_h, aspect=round(CW/CH,4), baselineFrac=round(1-base/CH,4), bodyFrac=round(np.mean([items[i][0].shape[0] for i in range(8)])/CH,4))
meta={}
for kind,name in [('punch','survivor-walk-punch-v4'),('melee','survivor-melee-swing-v4')]:
    sheet,m=pack(build(kind)); sheet.save(f'/root/chk/out/{name}.png', optimize=True); meta[name]=m
print(json.dumps(meta,indent=1))
