import numpy as np
from PIL import Image
from scipy import ndimage as nd
def frames(path):
    a=np.array(Image.open(path).convert('RGBA'))
    H,W=a.shape[:2]; m=a[...,3]>8
    lab,n=nd.label(m,structure=np.ones((3,3)))
    sl=nd.find_objects(lab); sizes=nd.sum(m,lab,range(1,n+1))
    big=[i for i in range(n) if sizes[i]>5000]
    out={}
    for i in big:
        ys,xs=np.where(lab==i+1)
        cell=(int(ys.mean()*4//H),int(xs.mean()*4//W))
        out[cell]={'ids':[i+1],'cell':cell}
    # attach small comps to nearest big by bbox center distance
    for i in range(n):
        if i in big: continue
        s=sl[i]; cy=(s[0].start+s[0].stop)/2; cx=(s[1].start+s[1].stop)/2
        def gap(f):
            j=f['ids'][0]-1; b=sl[j]
            dy=max(b[0].start-s[0].stop, s[0].start-b[0].stop, 0); dx=max(b[1].start-s[1].stop, s[1].start-b[1].stop, 0)
            return max(dx,dy)
        best=min(out.values(),key=gap)
        if gap(best)<=12 and sizes[i]>=4: best['ids'].append(i+1)
    res=[]
    for cell in sorted(out):
        f=out[cell]; mk=np.isin(lab,f['ids'])
        ys,xs=np.where(mk); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
        img=a[y0:y1,x0:x1].copy(); img[~mk[y0:y1,x0:x1]]=0
        h=y1-y0; top=mk[y0:y0+int(h*0.15),x0:x1]; hx=np.where(top)[1].mean()
        res.append(dict(cell=cell,img=img,x0=x0,y0=y0,h=h,w=x1-x0,headx=x0+hx,cellx=x0-cell[1]*W/4,headrel=x0+hx-cell[1]*W/4,bottom_rel=y1-cell[0]*H/4))
    return res,(W,H)
