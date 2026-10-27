import frames, numpy as np
def batmask(a):
    a=a.astype(int); h,w=a.shape[:2]
    yy,xx=np.mgrid[0:h,0:w]
    p0=np.array([30,150.]); p1=np.array([150,240.])
    d=p1-p0; t=np.clip(((xx-p0[0])*d[0]+(yy-p0[1])*d[1])/(d@d),0,1)
    dist=np.hypot(xx-(p0[0]+t*d[0]), yy-(p0[1]+t*d[1]))
    R,G,B=a[...,0],a[...,1],a[...,2]
    batcol=((R>G*1.15)&(R>B*1.25))|((R+G+B)<140)
    return (dist<19)&batcol&(a[...,3]>8)
