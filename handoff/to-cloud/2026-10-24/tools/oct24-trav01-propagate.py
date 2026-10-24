# Oct 24 — propagate CLOCK-01 O1–O6 (locked) into trav-01-traversal-slice.md. Run from E:\Zed_Idler.
p='reference/trav-01-traversal-slice.md'; s=open(p,encoding='utf-8').read()
a="repeatable up to a cap (cap `[OPEN]`, `clock-01-slice.md` O1)"
b="repeatable up to **2 per real day** (`[DECIDED Oct 24]`, `clock-01-slice.md` O1)"
c="| Code's timer survey (`reports/clock-01/`); open O1–O6 |"
d="| Code's timer survey (`reports/clock-01/`); O1–O6 `[DECIDED Oct 24]`; issued as `CURRENT_BATCH.md` Oct 24 |"
assert s.count(a)==1 and s.count(c)==1
s=s.replace(a,b).replace(c,d)
open(p,'w',encoding='utf-8').write(s)
print('ok')
