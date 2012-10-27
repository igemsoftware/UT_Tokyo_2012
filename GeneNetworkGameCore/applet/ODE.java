package genenetworkgamecore;

import genenetworkgamecore.Stage.*;

public class ODE {
  class FA{
    int a;
    int type;
    double d;
    // type==1 : dA/dt = -d*A
    // type==0 : dA/dt = d;
    FA(int a0, int t0, double d0){
      a = a0; type = t0; d = d0;
    }
    void add(double[] ret, double[] v){
      if(type==0){
        ret[a] += d;
      }else{
        ret[a] -= d*v[a];
      }
    }
  }
  
  class FAB{
    int a, b;
    double f, k;
    int type, n;
    // type==1 : dB/dt = f/((k/A)^n + 1)
    // type==0 : dB/dt = f*(1 - 1/((k/A)^n + 1))
    FAB(int a0, int b0, int t0, double f0, double k0, int n0){
      a = a0; b = b0; type = t0; f = f0; k = k0; n = n0;
    }
    void add(double[] ret, double[] v){
      if(type==0){
        ret[b] += f*(1.0-1.0/(Math.pow((k/v[a]), n)+1.0));
      }else{
        ret[b] += f/(Math.pow((k/v[a]), n)+1.0);
      }
    }
  }
  
  int NF;
  FA[] fas;
  FAB[] fabs;
  int nfas, nfabs;
  double[][] val;
  int input_type;
  double[][] inval;
  int[] input;
  double[] t_in;
  double[] s_in;
  double[] ival;
  
  ODE(Stage stg){
    nfas = 0;
    nfabs = 0;
    NF = stg.NF;
    input_type=stg.input_type;
    val = stg.os.f;
    inval = stg.is.f;
    input = new int[NF];
    t_in = new double[NF];
    s_in = new double[NF];
    ival = new double[NF];
    for(int i=0; i<stg.NF; i++){
      input[i] = stg.fs[i].input;
      t_in[i] = stg.fs[i].t_in;
      s_in[i] = stg.fs[i].s_in;
      ival[i] = stg.fs[i].ival;
    }
//    val = new double[stg.NF];
    fas = new FA[stg.NF];
    fabs = new FAB[stg.NF*stg.NP];
    // regulation relation
    for(int i=0; i<stg.NP; i++){
      for(int j=0; j<stg.NI; j++){
        if(stg.items[j].name.compareTo(stg.ps[i].name)==0){
          // j: item number of the promoter
          if(stg.items[j].num==-1) continue;
          for(int k=stg.items[j].num+1; k<stg.cs.ncnst[stg.items[j].len]; k++){
            if(stg.cs.cnst[stg.items[j].len][k].isProm==0){
              // stg.cs.cnst[stg.items[j].len][k] is a factor gene which is regulated by the prom
              Promoter tmpP = stg.ps[stg.items[j].promID];
              int b = stg.cs.cnst[stg.items[j].len][k].promID;
              int a = -1;
              if(tmpP.type==2){
                if(stg.fs[b].input==0) fas[nfas++] = new FA(b, 0, tmpP.str);
              }
              else{
                int ii;
                for(ii=0; ii<stg.NF; ii++){
                  if(stg.fs[ii].name.compareTo(tmpP.factor)==0){
                    a = ii;
                    break;
                  }
                }
                if(stg.fs[b].input==0 && ii<stg.NF) fabs[nfabs++] = new FAB(a, b, tmpP.type, stg.fs[b].rate*tmpP.str, tmpP.k, tmpP.n);
              }
            }
          }
        }
      }
      
    }
    // deg
    for(int i=0; i<stg.NF; i++){
      if(stg.fs[i].input==0) fas[nfas++] = new FA(i, 1, stg.fs[i].deg);
    }
    
    // debug
    for(int i=0; i<nfas; i++){
      System.out.println(fas[i].a);
    }
    for(int i=0; i<nfabs; i++){
      System.out.println(fabs[i].a + " " + fabs[i].b);
    }
  }
  
  double[] calcdf(double[] v){
    double[] ret = new double[NF];
    for(int i=0; i<nfas; i++){
      fas[i].add(ret, v);
    }
    for(int i=0; i<nfabs; i++){
      fabs[i].add(ret, v);
    }
    return ret;
  }
  
  // 4th order Runge-Kutta
  void simulate(int NT, double dt){
//    double[][] val = new double[NT][NF];
    double t = 0;
//    for(int i=0; i<NF; i++) val[0][i] = Math.random();
    for(int i=0; i<NF; i++) val[0][i] = ival[i];
    for(int i=1; i<NT; i++){
      double[] k1, k2, k3, k4;
      double[] v2, v3, v4;
      for(int j=0; j<NF; j++){
        if(input_type==0){
          if(input[j]==1){
            if(t<t_in[j]) val[i-1][j] = 0;
            else val[i-1][j] = s_in[j];
          }else if(input[j]==2){
            if(t<t_in[j]) val[i-1][j] = s_in[j];
            else val[i-1][j] = 0;
          }
        }else{
          if(input[j]!=0){
            val[i-1][j] = inval[i-1][j];
          }
        }
      }
      k1 = calcdf(val[i-1]);
      v2 = new double[NF];
      for(int j=0; j<NF; j++) v2[j] = val[i-1][j] + k1[j]*dt/2.0;
      k2 = calcdf(v2);
      v3 = new double[NF];
      for(int j=0; j<NF; j++) v3[j] = val[i-1][j] + k2[j]*dt/2.0;
      k3 = calcdf(v3);
      v4 = new double[NF];
      for(int j=0; j<NF; j++) v4[j] = val[i-1][j] + k3[j]*dt;
      k4 = calcdf(v4);
      for(int j=0; j<NF; j++) val[i][j] = val[i-1][j] + (k1[j]+2*k2[j]+2*k3[j]+k4[j])*dt/6.0;
      t += dt;
      }
    }
//    return val;
  }
  
