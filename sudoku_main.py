'''
Sudoku solver and generator

'''
import numpy as np
import random as rnd

def sdku_gen():
    while True:
        S=np.zeros((9,9),dtype=int)
        for i in range(9):
            for j in range(9):
                S[i,j]=sdku_num(S,i,j)
                if S[i,j] == 0: break
            if S[i,j] == 0: break
        if S[i,j] == 0: continue
        return S

def sdku_num(S,i,j):
    vec=np.arange(1, 10)
    for ii in range(i): # checkout rows
        vec[S[ii, j]-1] = 0
    for jj in range(j): # checkout columns
        vec[S[i, jj]-1] = 0
    for iii in range((i//3)*3, (i//3)*3+3): #checkout quadrants
        for jjj in range((j//3)*3, (j//3)*3+3):
            if S[iii, jjj] > 0:
                vec[S[iii, jjj]-1] = 0
    return 0 if len(vec[vec>0]) == 0 else rnd.choice(vec[vec>0])

def sdku_drain(s):
    vec=np.arange(81)
    rnd.shuffle(vec)
    for l in vec:
        sp=copy.deepcopy(s)
        sp[l//9,l%9] = 0
        if sdku_solv(sp):
            s[l//9,l%9] = 0
    return s, np.sum(s>0)

def sdku_solv(s):
    Samp=np.array([np.array([np.arange(1,10) for j in range(9)]) for i in range(9)])
    flag = 1
    while flag:
        flag = 0
        Samp = sdku_Sact(Samp,s)

        for i in range(9):
            for z in range(9):
                if np.sum(Samp[i,:,z]>0) == 1:
                    s[i,:] = s[i,:] + Samp[i,:,z]
                    Samp = sdku_Sact(Samp,s)
                    flag = 1
        for j in range(9):
            for z in range(9):
                if np.sum(Samp[:,j,z]>0) == 1:
                    s[:,j] = s[:,j] + Samp[:,j,z]
                    Samp = sdku_Sact(Samp,s)
                    flag = 1
        for i in range(3):
            for j in range(3):
                for z in range(9):
                    if np.sum(Samp[i*3:i*3+3,j*3:j*3+3,z]>0) == 1:
                        s[i*3:i*3+3,j*3:j*3+3] = s[i*3:i*3+3,j*3:j*3+3] + Samp[i*3:i*3+3,j*3:j*3+3,z]
                        Samp = sdku_Sact(Samp,s)
                        flag = 1
    return np.sum(s>0) == 81
    
def sdku_Sact(samp,s):
    for i in range(9):
        for j in range(9):
            if s[i,j] > 0:
                samp[i,:,s[i,j]-1] = 0
                samp[:,j,s[i,j]-1] = 0
                samp[(i//3)*3:(i//3)*3+3,(j//3)*3:(j//3)*3+3,s[i,j]-1] = 0
                samp[i,j,:] = 0
    return samp

def sdku_save(s):
    st = [','.join([str(l) for l in k]) for k in s]
    st = [k.replace('0','') for k in st]
    f = open('sudoku.csv','w')
    f.write('sudoku in csv\n')
    for k in st:
        f.write(k + '\n')
    f.close()
    pass

def main(p=50):
    print("\n"*50)
    while p>=23:
        S = sdku_gen()
        Sd, p = sdku_drain(S)
    sdku_save(Sd)

if __name__ == "__main__":
    main()