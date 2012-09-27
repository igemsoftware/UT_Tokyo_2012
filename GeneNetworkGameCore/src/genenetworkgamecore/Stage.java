package genenetworkgamecore;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;

import processing.core.*;

class Figure{
  String name;
  int x, y;
  int w, h;
  int hue;
  void draw(PApplet pa, PGraphics pg){
    pg.stroke(0);
    pg.fill(hue, 100, 100, 100);
    pg.rect(x, y, w, h);
    pg.fill(0);
    pg.text(name, x+10, y+15);
  }
}

class Item extends Figure{
  static int focus = -1;
  static int n = 0;
  int focused;
  int len;
  int num;
  int isProm;
  int isInput;
  int promID;
  int promType;
  void draw(PApplet pa, PGraphics pg){
    if(isProm==1){
      if(promType==0) pg.image(pa.loadImage("../data/imgs/prom0.png"), x, y, 70, 50);
      if(promType==1) pg.image(pa.loadImage("../data/imgs/prom1.png"), x, y, 70, 50);
      if(promType==2) pg.image(pa.loadImage("../data/imgs/prom2.png"), x, y, 70, 50);
      pg.fill(100);
      pg.text(name, x+5, y);
    }else{
      if(isInput==0){
        pg.stroke(0);
        pg.fill(hue, 100, 100, 100);
        pg.rect(x, y, w, h);
        pg.fill(0);
        pg.text(name, x+10, y+15);
      }else{
        pg.stroke(0);
        pg.fill(hue, 100, 100, 100);
        pg.ellipseMode(pa.CORNER);
        pg.ellipse(x, y, w, h);
        pg.fill(100);
        pg.textAlign(pa.CENTER);
        pg.text(name, x+w/2, y+h+15);
        pg.textAlign(pa.LEFT);
      }
    }
  }
}

public class Stage {
  public class Promoter{
    String name;
    int type;      // 0:repress 1:activate 2:constitutive
    double str;    // promoter strength
    int number;    // number of items
    String factor; // transcriptional factors
    double k;      // hill
    int n;         // hill  theta = 1/((k/x)^n + 1)
    Promoter(){}
    Promoter(String na0, int t0, double s0, int nm0, String f0, double k0, int n0){
      name = na0; type = t0; str = s0; number = nm0; factor = f0; k = k0; n = n0;
    }
  }
  public class Factor{
    String name;
    double deg;  // degradiation
    double rate; // copy rate
    int number;  // number of items
    double ival; // initial value
    int input;   // 0:not input, 1:on, 2:off
    double t_in; // timing of the input
    double s_in; // strength of the input
    Factor(){}
    Factor(String na0, double d0, double r0, int nm0, int in0, double t0){
      name = na0; deg = d0; rate = r0; number = nm0; input = in0; t_in = t0;
    }
/*
    void draw(PGraphics pg){
      pg.stroke(0);
      pg.noFill();
      pg.rect(x, y, w, h);
      pg.fill(0);
      pg.text(name, x+10, y+15);
      for(int i=0; i<nt; i++){
        for(int j=0; j<NP; j++){
          if(ps[j].name.compareTo(to[i])==0){
            pg.line(x+w/2, y+h/2, ps[j].x+ps[j].w/2, ps[j].y+ps[j].h/2);
          }
        }
      }
    }
    */
  }
  
  int NP;
  int NF;
  int NT;
  double dt;
  int input_type;
  
  Promoter[] ps;
  Factor[] fs;
  Input is;
  Output os;
  
  Construct cs;
  String stagename;
//  String[] short_desc;
  
  Item[] items;
  int NI = 0;
  
  ODE ode;
  int simFlag = 0;
  
  class Construct{
    Item[][] cnst;
    int[] ncnst;
    int nlen = 0;
    Construct(int mode){
      cnst = new Item[NP+NF][NP+NF];
      ncnst = new int[NP+NF];
      nlen = 0;
      for(int i=0; i<NP+NF; i++) ncnst[i] = 0;
      
      // sort by x
      for(int i=NI-1; i>=0; i--){
        for(int j=0; j<i; j++){
          if(items[j].x > items[j+1].x){
            Item tmp = items[j];
            items[j] = items[j+1];
            items[j+1] = tmp;
          }
        }
      }
      
      for(int i=0; i<NI; i++){
        items[i].num = -1;
        if(mode==1){
          if(items[i].x>700) continue;
        }
        int j;
        for(j=0; j<nlen; j++){
          if(Math.abs((items[i].y+items[i].h/2) - (cnst[j][0].y+cnst[j][0].h/2)) < 50){
            items[i].len = j;
            items[i].num = ncnst[j];
            cnst[j][ncnst[j]++] = items[i];
            break;
          }
        }
        if(j==nlen){
          cnst[nlen][0] = items[i];
          ncnst[nlen] = 1;
          items[i].len = nlen;
          items[i].num = 0;
          nlen++;
        }
      }
      
      // for debug
      System.out.println("###");
      for(int i=0; i<nlen; i++){
        System.out.print(ncnst[i]+":");
        for(int j=0; j<ncnst[i]; j++){
          System.out.print(cnst[i][j].name + "  ");
        }
        System.out.println();
      }
    }
    
  }
  
  class Input extends Figure{
    double[][] f;  // [time][factor]
    Input(int nt, int nf){
      f = new double[nt][nf];
    }
    
  }
  class Output extends Figure{
    double[][] f;
    Output(int nt, int nf){
      f = new double[nt][nf];
    }
  }
  
  Stage(){
    initialize_stage();
  }
  /*
  Stage(String filename){
    initialize_stage();
    loadFile(filename);
    reflesh();
  }
  */
  void initialize_stage(){
    NI = 0;
    NP = 0;
    NF = 0;
    NT = 660;
    dt = 0.4;
    items = new Item[1000];
    ps = new Stage.Promoter[1000];
    fs = new Stage.Factor[1000];
    is = new Input(1000, 50);
    os = new Output(1000, 50);
//    short_desc = new String[3];
    input_type=0;
  }
  
  void loadFile(String filename){   
    File fle = new File("../data/stages/"+filename);
    Scanner scan = null;
    try {
      scan = new Scanner(fle);
    } catch (FileNotFoundException e) {
      System.out.println(e);
    }
    scan.useDelimiter("\\n");
    
    String ln = null;
    /*
    while(scan.hasNext()){
      ln = scan.next();
      if(ln.charAt(0)!='#') break;
    }
    short_desc[0] = ln;
    ln = scan.next();
    short_desc[1] = ln;
    ln = scan.next();
    short_desc[2] = ln;
    */
    while(scan.hasNext()){
      ln = scan.next();
      if(ln.charAt(0)!='#') break;
    }
    String[] splt = ln.split(" ");
    NP = Integer.parseInt(splt[0]);
    NF = Integer.parseInt(splt[1]);
    NT = Integer.parseInt(splt[2]);
    dt = Double.parseDouble(splt[3]);
    
    // parse promoters
    for(int i=0; i<NP; i++){
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      ps[i] = new Promoter();
      ps[i].name = ln;
      ln = scan.next();
      splt = ln.split(" ");
      ps[i].type = Integer.parseInt(splt[0]);
      ps[i].str = Double.parseDouble(splt[1]);
      ps[i].number = Integer.parseInt(splt[2]);
      ln = scan.next();
      ps[i].factor = ln;
      ln = scan.next();
      splt = ln.split(" ");
      ps[i].k = Double.parseDouble(splt[0]);
      ps[i].n = Integer.parseInt(splt[1]);
      
      /*
      for(int j=0; j<ps[i].number; j++){
        items[NI] = new Item();
        items[NI].name = ps[i].name;
        items[NI].x = 50+NI*100;
        items[NI].y = 50;
        items[NI].w = 80;
        items[NI].h = 20;
        items[NI].isProm = 1;
        items[NI].promID = i;
        items[NI].hue = 70*i/NF;
        NI++;
        
      }
      */
    }
  //  int tmpNI = NI;
    // parse factor
    for(int i=0; i<NF; i++){
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      fs[i] = new Factor();
      fs[i].name = ln;
      ln = scan.next();
      splt = ln.split(" ");
      fs[i].deg = Double.parseDouble(splt[0]);
      fs[i].rate = Double.parseDouble(splt[1]);
      fs[i].number = Integer.parseInt(splt[2]);
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      fs[i].ival = Double.parseDouble(ln);
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      splt = ln.split(" ");
      fs[i].input = Integer.parseInt(splt[0]);
      fs[i].t_in = Double.parseDouble(splt[1]);
      fs[i].s_in = Double.parseDouble(splt[2]);
      
      }
    // input data
    while(scan.hasNext()){
      ln = scan.next();
      if(ln.charAt(0)!='#') break;
    }
    input_type = Integer.parseInt(ln);
    if(input_type==1){
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      for(int jf=0; jf<NF; jf++){
        for(int jt=0; jt<NT; jt++){
          is.f[jt][jf] = Double.parseDouble(ln);
          while(scan.hasNext()){
            ln = scan.next();
            if(ln.charAt(0)!='#') break;
          }
        }
      }
  /*
      for(int j=0; j<fs[i].number; j++){
        items[NI] = new Item();
        items[NI].name = fs[i].name;
        items[NI].x = 50+(NI-tmpNI)*100;
        items[NI].y = 100;
        items[NI].w = 80;
        items[NI].h = 20;
        items[NI].isProm = 0;
        items[NI].promID = i;
        items[NI].hue = 70*i/NF;
        NI++;
        
      }
      */
    }
    for(int i=0; i<NT; i++){
      for(int j=0; j<NF; j++){
        if(input_type==0){
          if(fs[j].input==1){
            os.f[i][j] = dt*i < fs[j].t_in ? 0 : fs[j].s_in;
          }
          if(fs[j].input==2){
            os.f[i][j] = dt*i > fs[j].t_in ? 0 : fs[j].s_in;
          }
        }else if(input_type==1){
          if(fs[j].input!=0){
            os.f[i][j] = is.f[i][j];
          }
        }
      }
    }
    
  }
  
  void reflesh_gc(){
    NI = 0;
    simFlag=0;
    for(int i=0; i<NP; i++){
      for(int j=0; j<ps[i].number; j++){
        items[NI] = new Item();
        items[NI].name = ps[i].name;
        items[NI].x = 100+NI*100;
        items[NI].y = 110;
        items[NI].w = 70;
        items[NI].h = 50;
        items[NI].isProm = 1;
        items[NI].promID = i;
        items[NI].isInput = 0;
        items[NI].promType = ps[i].type;
        items[NI].hue = 90*i/(NP+1);
        NI++;
      }
    }
    int tmpNI = NI;
    int tmpNIF = 0; // number of input
    for(int i=0; i<NF; i++){
      for(int j=0; j<fs[i].number; j++){
        items[NI] = new Item();
        items[NI].name = fs[i].name;
        items[NI].x = 100+(NI-tmpNI-tmpNIF)*100;
        items[NI].y = 180;
        items[NI].w = 60;
        items[NI].h = 20;
        items[NI].isProm = 0;
        items[NI].promID = i;
        items[NI].isInput = fs[i].input;
        if(fs[i].input!=0){
          items[NI].w = 30;
          items[NI].h = 30;
          items[NI].x = 30;
          items[NI].y = 60+tmpNIF*60;
          tmpNIF++;
        }
        items[NI].hue = 90*i/(NF+1);
        NI++;
      }
    }
  }

  void reflesh_game(){
    NI = 0;
    simFlag=0;
    for(int i=0; i<NP; i++){
      for(int j=0; j<ps[i].number; j++){
        items[NI] = new Item();
        items[NI].name = ps[i].name;
        items[NI].x = 720;
        items[NI].y = 70+NI*50;
        items[NI].w = 70;
        items[NI].h = 50;
        items[NI].isProm = 1;
        items[NI].promID = i;
        items[NI].isInput = 0;
        items[NI].promType = ps[i].type;
        items[NI].hue = 90*i/(NP+1);
        NI++;
      }
    }
    int tmpNI = NI;
    int tmpNIF = 0; // number of input
    for(int i=0; i<NF; i++){
      for(int j=0; j<fs[i].number; j++){
        items[NI] = new Item();
        items[NI].name = fs[i].name;
        items[NI].x = 800;
        items[NI].y = 70+(NI-tmpNI-tmpNIF)*50;
        items[NI].w = 60;
        items[NI].h = 20;
        items[NI].isProm = 0;
        items[NI].promID = i;
        items[NI].isInput = fs[i].input;
        if(fs[i].input!=0){
          items[NI].w = 30;
          items[NI].h = 30;
          items[NI].x = 30;
          items[NI].y = 60+tmpNIF*60;
          tmpNIF++;
        }
        items[NI].hue = 90*i/(NF+1);
        NI++;
      }
    }
  }
  
  
  void saveFile(String filename){
    File file = new File("../data/stages/"+filename);
    PrintWriter pw = null;
    try {
      pw = new PrintWriter(new BufferedWriter(new FileWriter(file)));
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
//    pw.println(short_desc[0]);
//    pw.println(short_desc[1]);
//    pw.println(short_desc[2]);
    pw.println("### NP, NF, NT, dt");
    pw.println(NP + " " + NF + " " + 660 + " " + dt);
    pw.println("### promoter data");
    pw.println("#   name");
    pw.println("#   type, strength, number of genes");
    pw.println("#   factor name");
    pw.println("#   k, n");
    pw.println("###");
    for(int i=0; i<NP; i++){
      pw.println(ps[i].name);
      pw.println(ps[i].type+" "+ps[i].str+" "+ps[i].number);
      pw.println(ps[i].factor);
      pw.println(ps[i].k+" "+ps[i].n);
    }
    pw.println("### factor data");
    pw.println("#   name");
    pw.println("#   degeneration, copy rate, number of genes");
    pw.println("#   initial value");
    pw.println("#   input type, timing, strength");
    pw.println("###");
    for(int i=0; i<NF; i++){
      pw.println(fs[i].name);
      pw.println(fs[i].deg+" "+fs[i].rate+" "+fs[i].number);
      pw.println(fs[i].ival);
      pw.println(fs[i].input+" "+fs[i].t_in+" "+fs[i].s_in);
    }
    pw.println("### input type");
    pw.println(1);
    pw.println("### input data");
    for(int i=0; i<NF; i++){
      pw.println("### factor:" + i);
      for(int j=0; j<660; j++){
        pw.println(os.f[j][i]);
      }
    }
    pw.println("### END");
    pw.close();
  }
  
  // press
  // release
  void drawArrow(int type, float x0, float y0, float x1, float y1, PGraphics pg){
    float dst = (float)Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
    if(dst>45){
      x1 = x0+(x1-x0)*((dst-40)/dst);
      y1 = y0+(y1-y0)*((dst-40)/dst);
    }
    pg.strokeWeight(3);
    pg.fill(0);
    float len;
    double theta = Math.atan2(y1-y0, x1-x0);
    if(type==0){
      pg.smooth();
      pg.stroke(64, 100, 100, 50);
//      pg.fill(70, 100, 100, 70);
      len = 10;
      pg.line(x0, y0, x1, y1);
      pg.line(x1, y1, x1+len*(float)Math.cos(theta+Math.PI/2), y1+len*(float)Math.sin(theta+Math.PI/2));
      pg.line(x1, y1, x1+len*(float)Math.cos(theta-Math.PI/2), y1+len*(float)Math.sin(theta-Math.PI/2));
      pg.stroke(64, 70, 100, 100);
      pg.strokeWeight(1);
      pg.line(x0, y0, x1, y1);
      pg.line(x1, y1, x1+len*(float)Math.cos(theta+Math.PI/2), y1+len*(float)Math.sin(theta+Math.PI/2));
      pg.line(x1, y1, x1+len*(float)Math.cos(theta-Math.PI/2), y1+len*(float)Math.sin(theta-Math.PI/2));
      pg.noSmooth();
    }else{
      pg.smooth();
      pg.stroke(0, 100, 100, 50);
//      pg.fill(0, 100, 100, 70);
      len = 15;
      pg.line(x0, y0, x1, y1);
      pg.line(x1, y1, x1-len*(float)Math.cos(theta+Math.PI/6), y1-len*(float)Math.sin(theta+Math.PI/6));
      pg.line(x1, y1, x1-len*(float)Math.cos(theta-Math.PI/6), y1-len*(float)Math.sin(theta-Math.PI/6));
      pg.stroke(0, 70, 100, 100);
      pg.strokeWeight(1);
      pg.line(x0, y0, x1, y1);
      pg.line(x1, y1, x1-len*(float)Math.cos(theta+Math.PI/6), y1-len*(float)Math.sin(theta+Math.PI/6));
      pg.line(x1, y1, x1-len*(float)Math.cos(theta-Math.PI/6), y1-len*(float)Math.sin(theta-Math.PI/6));
      pg.noSmooth();
//      pg.triangle(x1, y1, x1-len*(float)Math.cos(theta+Math.PI/6), y1-len*(float)Math.sin(theta+Math.PI/6), x1-len*(float)Math.cos(theta-Math.PI/6), y1-len*(float)Math.sin(theta-Math.PI/6));
    }
    //pg.line(x1, y1, x1+0.1f*(float)((x0-x1)*Math.cos(Math.PI/4)-(y0-y1)*Math.sin(Math.PI/4)), y1+0.1f*(float)((x0-x1)*Math.sin(Math.PI/4)+(y0-y1)*Math.cos(Math.PI/4)));
    //pg.line(x1, y1, x1+0.1f*(float)((x0-x1)*Math.cos(Math.PI/4)+(y0-y1)*Math.sin(Math.PI/4)), y1-0.1f*(float)((x0-x1)*Math.sin(Math.PI/4)+(y0-y1)*Math.cos(Math.PI/4)));
    pg.strokeWeight(1);
  }
  
  
  // items and arrows
  void drawItems(PApplet pa, PGraphics pg){
    pg.beginDraw();
    pg.colorMode(pg.HSB, 100);
    for(int i=0; i<NI; i++){
      if(items[i].isProm==1){
        float tmpX0 = (items[i].x+items[i].w/2);
        float tmpY0 = (items[i].y+items[i].h/2);
        for(int j=0; j<NI; j++){
          if(ps[items[i].promID].factor.compareTo(items[j].name)==0){
            float tmpX1 = (items[j].x+items[j].w/2);
            float tmpY1 = (items[j].y+items[j].h/2);
            drawArrow(items[i].promType, tmpX1, tmpY1, tmpX0, tmpY0, pg);
          }
        }
      }
    }
    pg.strokeWeight(1);
    for(int i=0; i<NI; i++){
      items[i].draw(pa, pg);
    }
    pg.endDraw();
  }
  
  void drawGraph(PApplet pa, PGraphics pg){
    pg.beginDraw();
    pg.colorMode(pg.HSB, 100);
    pg.background(0);
    if(simFlag==0){
      for(int i=1; i<NT; i++){
        for(int j=0; j<NF; j++){
          if(input_type==0){
//            System.out.println(NT + " " + NF);
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
            }
          }else if(input_type==1){
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.strokeWeight(3);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
              pg.strokeWeight(1);
            }else{
              if(i%6<3){
                pg.strokeWeight(3);
                pg.stroke(90*j/(NF+1), 100, 100);
                pg.line(i-1, pg.height-(float)(100.0*is.f[i-1][j])-3, i, pg.height-(float)(100.0*is.f[i][j])-3);
                pg.strokeWeight(1);
              }
            }
          }
        }
      }
    }
    else if(simFlag>0){
      for(int i=1; i<simFlag; i++){
        for(int j=0; j<NF; j++){
          if(input_type==1){
            if(fs[j].input==0){
              if(i%3==0){
                pg.stroke(90*j/(NF+1), 100, 100);
                pg.line(i-1, pg.height-(float)(100.0*is.f[i-1][j])-3, i, pg.height-(float)(100.0*is.f[i][j])-3);
              }
            }
          }
          pg.stroke(90*j/(NF+1), 100, 100);
          pg.strokeWeight(3);
          pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
          pg.strokeWeight(1);
        }
      }
      for(int i=simFlag; i<NT; i++){
        for(int j=0; j<NF; j++){
          if(input_type==0){
//            System.out.println(NT + " " + NF);
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
            }
          }else if(input_type==1){
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.strokeWeight(3);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
              pg.strokeWeight(1);
            }else{
              if(i%3==0){
                pg.stroke(90*j/(NF+1), 100, 100);
                pg.line(i-1, pg.height-(float)(100.0*is.f[i-1][j])-3, i, pg.height-(float)(100.0*is.f[i][j])-3);
              }
            }
          }
        }
      }
      pg.stroke(0, 0, 100);
      pg.line(simFlag, 0, simFlag, pg.height);
      simFlag+=3;
      if(simFlag>NT) simFlag=NT;
    }
    for(int i=0; i<NF; i++){    
      pg.fill(100);
      pg.text(fs[i].name, 5, i*15+10);
      pg.stroke(90*i/(NF+1), 100, 100);
      pg.line(40, i*15+5, 100, i*15+5);
    }
    pg.endDraw();
    
  }
  void drawGraph_gc(PApplet pa, PGraphics pg){
    pg.beginDraw();
    pg.colorMode(pg.HSB, 100);
    pg.background(0);
    if(simFlag==0){
      for(int i=1; i<NT; i++){
        for(int j=0; j<NF; j++){
          if(input_type==0){
//            System.out.println(NT + " " + NF);
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
            }
          }else if(input_type==1){
            if(fs[j].input!=0){
              pg.stroke(90*j/(NF+1), 100, 100);
              pg.strokeWeight(1);
              pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
              pg.strokeWeight(1);
            }
          }
        }
      }
    }else{
      for(int i=1; i<NT; i++){
        for(int j=0; j<NF; j++){
          pg.stroke(90*j/(NF+1), 100, 100);
          pg.strokeWeight(1);
          pg.line(i-1, pg.height-(float)(100.0*os.f[i-1][j])-3, i, pg.height-(float)(100.0*os.f[i][j])-3);
          pg.strokeWeight(1);
        }
      }
    }
    for(int i=0; i<NF; i++){    
      pg.fill(100);
      pg.text(fs[i].name, 5, i*15+10);
      pg.stroke(90*i/(NF+1), 100, 100);
      pg.line(40, i*15+5, 100, i*15+5);
    }
    pg.endDraw();
    
  }
  
  void draw(PApplet pa, PGraphics pg_c, PGraphics pg_g, int mode){
    // construct
    pg_c.beginDraw();
    pg_c.colorMode(pg_c.HSB, 100);
    pg_c.background(0,0,100);
    pg_c.stroke(20);
    pg_c.strokeWeight(3);
    if(mode==0){
      pg_c.line(0, 150, pg_c.width, 150);
      pg_c.line(0, 250, pg_c.width, 250);
      pg_c.line(0, 350, pg_c.width, 350);
    }else{
      pg_c.line(370, 100, pg_c.width-30, 100);
      pg_c.line(370, 180, pg_c.width-30, 180);
      pg_c.line(370, 260, pg_c.width-30, 260);
      pg_c.line(370, 340, pg_c.width-30, 340);
    }
    drawItems(pa, pg_c);
    drawGraph(pa, pg_g);
    if(mode==1){
      pg_c.stroke(0);
      pg_c.strokeWeight(3);
      pg_c.line(350, 10, 350, pg_c.height-10);
      pg_c.strokeWeight(1);
    }
    pg_c.endDraw();
    
    // graph
    
  }

  public void rightClicked(int mx, int my){
    
    for(int i=0; i<NI; i++){
      if(items[i].x<mx && items[i].x+items[i].w>mx && items[i].y<my && items[i].y+items[i].h>my){
        if(items[i].isProm==0){
          fs[items[i].promID].number--;
        }else{
          ps[items[i].promID].number--;
        }
        for(int j=i; j<NI-1; j++){
          items[j] = items[j+1];
        }
        NI--;
        break;
      }
    }
    
  }
  void mousePressed(int mx, int my){
//    System.out.println("p " + mx + " " + my);
    
    for(int i=0; i<NI; i++){
      if(items[i].x<mx && items[i].x+items[i].w>mx && items[i].y<my && items[i].y+items[i].h>my){
        if(items[i].isProm==1 || items[i].isInput==0) items[i].focused = 1;
        break;
      }
    }
  }
  void mouseDragged(int mx, int my){
//    System.out.println("d " + mx + " " + my);
    for(int i=0; i<NI; i++){
      if(items[i].focused == 1){
        items[i].x = mx-items[i].w/2;
        items[i].y = my-items[i].h/2;
      }
    }
  }
  void mouseReleased(int mx, int my){
//    System.out.println("r " + mx + " " + my);
    for(int i=0; i<NI; i++){
      if(items[i].x<mx && items[i].x+items[i].w>mx && items[i].y<my && items[i].y+items[i].h>my){
        items[i].focused = 0;
      }
    }
  }
  
  void newConstruct(PApplet pa, int mode){
    cs = new Construct(mode);
  }
  
  void simulate(){
    ode = new ODE(this);
    ode.simulate(NT, dt);
    simFlag = 1;
  }
  
  int isCorrect(){
    double score = 0;
    for(int i=0; i<NT; i++){
      for(int j=0; j<NF; j++){
        score += Math.abs(os.f[i][j]-is.f[i][j]);
      }
    }
    if(score > 1.0) return 0;
    else return 1;
  }
}
