package genenetworkgamecore;

import genenetworkgamecore.GUI;
import genenetworkgamecore.Stage.*;
import processing.core.*;
import controlP5.*;

public class GUI_GameCreator extends GUI{
  PGraphics cnst, graph;
  PImage bg, bone;
  Stage stg;
  ListBox lp, lf;
  int nlp, nlf;
  
  GUI_GameCreator(GeneNetworkGameCore pg0){
    pg = pg0;
    cnst = pg.createGraphics(600, 400, pg.P2D);
    graph = pg.createGraphics(660, 210, pg.P2D);
    bg = pg.loadImage("../data/imgs/background_gc.png");
    bone = pg.loadImage("../data/imgs/bone.png");
    cnst.colorMode(pg.HSB, 100);
    graph.colorMode(pg.HSB, 100);
    nlp = 0;
    nlf = 0;
    stg = new Stage();
    cp5 = new ControlP5(pg);
    cp5.setFont(pg.loadFont("../data/fonts/Futura.vlw"), 10);
    cp5.setColorBackground(pg.color(60, 100, 50));

    
    cp5.addButton("title")
      .setPosition(10, 10)
      .setSize(60, 20)
      ;
    cp5.addButton("save")
    .setPosition(100, 10)
    .setSize(60, 20)
    ;
    cp5.addTextfield("savefile name")
    .setPosition(170, 10)
    .setSize(90, 20)
    .setValue("output.txt")
    ;
    cp5.addButton("load")
    .setPosition(290, 10)
    .setSize(60, 20)
    ;
    cp5.addTextfield("loadfile name")
    .setPosition(360, 10)
    .setSize(90, 20)
    .setValue("input.txt")
    ;
    
    lp = cp5.addListBox("promoter_list")
        .setPosition(710, 60)
        .setSize(180, 120)
        .setBarHeight(15)
        ;
    cp5.addButton("promoter_add")
      .setLabel("ADD")
      .setPosition(720, 200)
      .setSize(50, 20)
      ;
    cp5.addButton("promoter_remove")
      .setLabel("REMOVE")
      .setPosition(775, 200)
      .setSize(50, 20)
      ;
    cp5.addButton("promoter_edit")
      .setLabel("EDIT")
      .setPosition(830, 200)
      .setSize(50, 20)
      ;
    /*
    cp5.addButton("promoter_inventory")
      .setLabel("-->")
      .setPosition(320, 225)
      .setSize(60, 20)
      ;*/
    lf = cp5.addListBox("factor_list")
        .setPosition(710, 240)
        .setSize(180, 120)
        .setBarHeight(15)
        ;
    cp5.addButton("factor_add")
      .setLabel("ADD")
      .setPosition(720, 380)
      .setSize(50, 20)
      ;
    cp5.addButton("factor_remove")
      .setLabel("REMOVE")
      .setPosition(775, 380)
      .setSize(50, 20)
      ;
    cp5.addButton("factor_edit")
      .setLabel("EDIT")
      .setPosition(830, 380)
      .setSize(50, 20)
      ;
    /*
    cp5.addButton("factor_inventory")
      .setLabel("-->")
      .setPosition(320, 425)
      .setSize(60, 20)
      ;*/

    cp5.addButton("reflesh")
      .setPosition(720, 450)
      .setSize(60, 20)
      ;
    cp5.addButton("run")
      .setPosition(720, 480)
      .setSize(60, 20)
      ;
    /*
    cp5.addTextlabel("label")
      .setText("Gene Network Game")
      .setPosition(pg.width/2, pg.height/2)
      .setColorValue(pg.color(100,100,100))
      .setFont(pg.createFont("Serif", 20))
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    cp5.addButton("start")
      .setPosition(pg.width/2, pg.height*2/3)
      .setSize(100, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
      */
  }
  public void event(ControlEvent e){
    if(e.isGroup()){
      if(e.getGroup().getName().compareTo("promoter_list")==0){
        lp.getItem(nlp).setColorBackground(pg.color(60, 100, 100, 40));
        nlp = (int)e.getGroup().getValue();
        lp.getItem(nlp).setColorBackground(pg.color(0, 100, 100, 40));
      }else if(e.getGroup().getName().compareTo("factor_list")==0){
        lf.getItem(nlf).setColorBackground(pg.color(60, 100, 100, 40));
        nlf = (int)e.getGroup().getValue();
        lf.getItem(nlf).setColorBackground(pg.color(0, 100, 100, 40));
      }
    }else if(e.isController()){
      if(e.getController().getName().compareTo("title")==0){
        pg.toTitle();
      }else if(e.getController().getName().compareTo("save")==0){
        stg.saveFile(cp5.get(Textfield.class, "savefile name").getText());
      }else if(e.getController().getName().compareTo("load")==0){
        stg = new Stage();
        stg.initialize_stage();
        stg.loadFile(cp5.get(Textfield.class, "loadfile name").getText());
        stg.reflesh_gc();
        lp.clear();
        lf.clear();
        for(int i=0; i<stg.NP; i++){
          lp.addItem(stg.ps[i].name, i);
          lp.getItem(i).setColorBackground(pg.color(60, 100, 100, 30));
        }
        for(int i=0; i<stg.NF; i++){
          lf.addItem(stg.fs[i].name, i);
          lf.getItem(i).setColorBackground(pg.color(60, 100, 100, 30));
        }
        nlp = 0;
        nlf = 0;
        lp.getItem(nlp).setColorBackground(pg.color(0, 100, 100, 40));
        lf.getItem(nlf).setColorBackground(pg.color(0, 100, 100, 40));
      }else if(e.getController().getName().compareTo("promoter_inventory")==0){
//        stg.addInvProm(nlp);
      }else if(e.getController().getName().compareTo("promoter_edit")==0){
        win = cp5.addControlWindow("PEditWindow", 100, 100, 380, 400);
        win.hideCoordinates();
        cp5.addTextfield("name")
          .setPosition(20, 40)
          .setSize(200, 30)
          .setValue(stg.ps[nlp].name)
          .setWindow(win)
          ;
        cp5.addTextfield("type")
        .setPosition(20, 120)
        .setSize(90, 30)
        .setValue(""+stg.ps[nlp].type)
        .setWindow(win)
        ;
        cp5.addTextfield("strength")
        .setPosition(145, 120)
        .setSize(90, 30)
        .setValue(""+stg.ps[nlp].str)
        .setWindow(win)
        ;
        cp5.addTextfield("# of genes")
        .setPosition(270, 120)
        .setSize(90, 30)
        .setValue(""+stg.ps[nlp].number)
        .setWindow(win)
        ;
        cp5.addTextfield("factor name")
        .setPosition(20, 200)
        .setSize(200, 30)
        .setValue(stg.ps[nlp].factor)
        .setWindow(win)
        ;
        cp5.addTextfield("k")
        .setPosition(20, 280)
        .setSize(90, 30)
        .setValue(""+stg.ps[nlp].k)
        .setWindow(win)
        ;
        cp5.addTextfield("n")
        .setPosition(145, 280)
        .setSize(90, 30)
        .setValue(""+stg.ps[nlp].n)
        .setWindow(win)
        ;
        cp5.addButton("promoter_edit_OK")
        .setLabel("OK")
        .setPosition(300, 350)
        .setSize(50, 30)
        .setWindow(win)
        ;
      }else if(e.getController().getName().compareTo("promoter_add")==0){
        win = cp5.addControlWindow("PEditWindow", 100, 100, 380, 400);
        win.hideCoordinates();
        cp5.addTextfield("name")
          .setPosition(20, 40)
          .setSize(200, 30)
          .setValue("")
          .setWindow(win)
          ;
        cp5.addTextfield("type")
        .setPosition(20, 120)
        .setSize(90, 30)
        .setValue("1")
        .setWindow(win)
        ;
        cp5.addTextfield("strength")
        .setPosition(145, 120)
        .setSize(90, 30)
        .setValue("1.0")
        .setWindow(win)
        ;
        cp5.addTextfield("# of genes")
        .setPosition(270, 120)
        .setSize(90, 30)
        .setValue("1")
        .setWindow(win)
        ;
        cp5.addTextfield("factor name")
        .setPosition(20, 200)
        .setSize(200, 30)
        .setValue("")
        .setWindow(win)
        ;
        cp5.addTextfield("k")
        .setPosition(20, 280)
        .setSize(90, 30)
        .setValue("0.1")
        .setWindow(win)
        ;
        cp5.addTextfield("n")
        .setPosition(145, 280)
        .setSize(90, 30)
        .setValue("2")
        .setWindow(win)
        ;
        cp5.addButton("promoter_add_OK")
        .setLabel("OK")
        .setPosition(300, 350)
        .setSize(50, 30)
        .setWindow(win)
        ;
      }else if(e.getController().getName().compareTo("promoter_edit_OK")==0){
        stg.ps[nlp].name = cp5.get(Textfield.class, "name").getText();
//        cp5.get(Textfield.class, "name").remove();
        stg.ps[nlp].type = Integer.parseInt(cp5.get(Textfield.class, "type").getText());
//        cp5.get(Textfield.class, "type").remove();
        stg.ps[nlp].str = Double.parseDouble(cp5.get(Textfield.class, "strength").getText());
//        cp5.get(Textfield.class, "strength").remove();
        stg.ps[nlp].number = Integer.parseInt(cp5.get(Textfield.class, "# of genes").getText());
//        cp5.get(Textfield.class, "# of genes").remove();
        stg.ps[nlp].factor = cp5.get(Textfield.class, "factor name").getText();
//        cp5.get(Textfield.class, "factor name").remove();
        stg.ps[nlp].k = Double.parseDouble(cp5.get(Textfield.class, "k").getText());
//        cp5.get(Textfield.class, "k").remove();
        stg.ps[nlp].n = Integer.parseInt(cp5.get(Textfield.class, "n").getText());
//        cp5.get(Textfield.class, "n").remove();
        win.clear();
        win.remove();
      }else if(e.getController().getName().compareTo("promoter_add_OK")==0){
        stg.ps[stg.NP] = stg.new Promoter();
        stg.ps[stg.NP].name = cp5.get(Textfield.class, "name").getText();
//      cp5.get(Textfield.class, "name").remove();
      stg.ps[stg.NP].type = Integer.parseInt(cp5.get(Textfield.class, "type").getText());
//      cp5.get(Textfield.class, "type").remove();
      stg.ps[stg.NP].str = Double.parseDouble(cp5.get(Textfield.class, "strength").getText());
//      cp5.get(Textfield.class, "strength").remove();
      stg.ps[stg.NP].number = Integer.parseInt(cp5.get(Textfield.class, "# of genes").getText());
//      cp5.get(Textfield.class, "# of genes").remove();
      stg.ps[stg.NP].factor = cp5.get(Textfield.class, "factor name").getText();
//      cp5.get(Textfield.class, "factor name").remove();
      stg.ps[stg.NP].k = Double.parseDouble(cp5.get(Textfield.class, "k").getText());
//      cp5.get(Textfield.class, "k").remove();
      stg.ps[stg.NP].n = Integer.parseInt(cp5.get(Textfield.class, "n").getText());
//      cp5.get(Textfield.class, "n").remove();
      lp.addItem(stg.ps[stg.NP].name, stg.NP);
      lp.getItem(stg.NP).setColorBackground(pg.color(60, 100, 100, 30));
      stg.NP++;
      win.clear();
      win.remove();
    }else if(e.getController().getName().compareTo("promoter_remove")==0){
      lp.removeItem(lp.getItem(nlp).getName());
      for(int i=nlp+1; i<stg.NP; i++){
        String tmpName = lp.getItem(nlp).getName();
        lp.removeItem(tmpName);
        lp.addItem(tmpName, i-1);
        lp.getItem(i-1).setColorBackground(pg.color(60, 100, 100, 40));
        stg.ps[i-1] = stg.ps[i];
      }
      stg.NP--;
      // debug-
      /*
      for(int i=0; i<stg.NP; i++){
        System.out.print(lp.getItem(i).getName()+" ");
        System.out.println(lp.getItem(i).getValue());
      }
      */
      // -debug
      nlp = 0;
      if(stg.NP>0){
        lp.getItem(nlp).setColorBackground(pg.color(0, 100, 100, 40));
      }
  }else if(e.getController().getName().compareTo("factor_edit")==0){
    win = cp5.addControlWindow("PEditWindow", 100, 100, 380, 400);
    win.hideCoordinates();
    cp5.addTextfield("name")
      .setPosition(20, 40)
      .setSize(200, 30)
      .setValue(stg.fs[nlf].name)
      .setWindow(win)
      ;
    cp5.addTextfield("degradation speed")
    .setPosition(20, 120)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].deg)
    .setWindow(win)
    ;
    cp5.addTextfield("copy rate")
    .setPosition(145, 120)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].rate)
    .setWindow(win)
    ;
    cp5.addTextfield("# of genes")
    .setPosition(270, 120)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].number)
    .setWindow(win)
    ;
    cp5.addTextfield("initial_value")
    .setPosition(20, 200)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].ival)
    .setWindow(win)
    ;
    cp5.addTextfield("input_type")
    .setPosition(20, 280)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].input)
    .setWindow(win)
    ;
    cp5.addTextfield("timing")
    .setPosition(145, 280)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].t_in)
    .setWindow(win)
    ;
    cp5.addTextfield("strength")
    .setPosition(270, 280)
    .setSize(90, 30)
    .setValue(""+stg.fs[nlf].s_in)
    .setWindow(win)
    ;
    cp5.addButton("factor_edit_OK")
    .setLabel("OK")
    .setPosition(300, 350)
    .setSize(50, 30)
    .setWindow(win)
    ;
  }else if(e.getController().getName().compareTo("factor_add")==0){
    win = cp5.addControlWindow("PEditWindow", 100, 100, 380, 400);
    win.hideCoordinates();
    cp5.addTextfield("name")
      .setPosition(20, 40)
      .setSize(200, 30)
      .setValue("")
      .setWindow(win)
      ;
    cp5.addTextfield("degradation speed")
    .setPosition(20, 120)
    .setSize(90, 30)
    .setValue("0.05")
    .setWindow(win)
    ;
    cp5.addTextfield("copy rate")
    .setPosition(145, 120)
    .setSize(90, 30)
    .setValue("0.1")
    .setWindow(win)
    ;
    cp5.addTextfield("# of genes")
    .setPosition(270, 120)
    .setSize(90, 30)
    .setValue("1")
    .setWindow(win)
    ;
    cp5.addTextfield("initial_value")
    .setPosition(20, 200)
    .setSize(90, 30)
    .setValue("0.0")
    .setWindow(win)
    ;
    cp5.addTextfield("input_type")
    .setPosition(20, 280)
    .setSize(90, 30)
    .setValue("0")
    .setWindow(win)
    ;
    cp5.addTextfield("timing")
    .setPosition(145, 280)
    .setSize(90, 30)
    .setValue("0")
    .setWindow(win)
    ;
    cp5.addTextfield("strength")
    .setPosition(270, 280)
    .setSize(90, 30)
    .setValue("1.0")
    .setWindow(win)
    ;
    cp5.addButton("factor_add_OK")
    .setLabel("OK")
    .setPosition(300, 350)
    .setSize(50, 30)
    .setWindow(win)
    ;
  }else if(e.getController().getName().compareTo("factor_edit_OK")==0){
    stg.fs[nlf].name = cp5.get(Textfield.class, "name").getText();
//    cp5.get(Textfield.class, "name").remove();
    stg.fs[nlf].deg = Double.parseDouble(cp5.get(Textfield.class, "degradation speed").getText());
//    cp5.get(Textfield.class, "type").remove();
    stg.fs[nlf].rate = Double.parseDouble(cp5.get(Textfield.class, "copy rate").getText());
//    cp5.get(Textfield.class, "strength").remove();
    stg.fs[nlf].number = Integer.parseInt(cp5.get(Textfield.class, "# of genes").getText());
//    cp5.get(Textfield.class, "# of genes").remove();
    stg.fs[nlf].ival = Double.parseDouble(cp5.get(Textfield.class, "initial_value").getText());
    stg.fs[nlf].input = Integer.parseInt(cp5.get(Textfield.class, "input_type").getText());
    stg.fs[nlf].t_in = Double.parseDouble(cp5.get(Textfield.class, "timing").getText());
    stg.fs[nlf].s_in = Double.parseDouble(cp5.get(Textfield.class, "strength").getText());
    if(stg.fs[nlf].input!=0){
      for(int i=0; i<stg.NT; i++){
        int j=nlf;
        if(stg.fs[j].input==1){
          stg.os.f[i][j] = stg.dt*i < stg.fs[j].t_in ? 0 : stg.fs[j].s_in;
          stg.is.f[i][j] = stg.os.f[i][j];
        }
        if(stg.fs[j].input==2){
          stg.os.f[i][j] = stg.dt*i > stg.fs[j].t_in ? 0 : stg.fs[j].s_in;
          stg.is.f[i][j] = stg.os.f[i][j];
        }
      }
    }
    win.clear();
    win.remove();
  }else if(e.getController().getName().compareTo("factor_add_OK")==0){
    stg.fs[stg.NF] = stg.new Factor();
    stg.fs[stg.NF].name = cp5.get(Textfield.class, "name").getText();
  //  cp5.get(Textfield.class, "name").remove();
    stg.fs[stg.NF].deg = Double.parseDouble(cp5.get(Textfield.class, "degradation speed").getText());
  //  cp5.get(Textfield.class, "type").remove();
    stg.fs[stg.NF].rate = Double.parseDouble(cp5.get(Textfield.class, "copy rate").getText());
  //  cp5.get(Textfield.class, "strength").remove();
    stg.fs[stg.NF].ival = Double.parseDouble(cp5.get(Textfield.class, "initial_value").getText());
    stg.fs[stg.NF].number = Integer.parseInt(cp5.get(Textfield.class, "# of genes").getText());
    stg.fs[stg.NF].input = Integer.parseInt(cp5.get(Textfield.class, "input_type").getText());
    stg.fs[stg.NF].t_in = Double.parseDouble(cp5.get(Textfield.class, "timing").getText());
    stg.fs[stg.NF].s_in = Double.parseDouble(cp5.get(Textfield.class, "strength").getText());
    lf.addItem(stg.fs[stg.NF].name, stg.NF);
    lf.getItem(stg.NF).setColorBackground(pg.color(60, 100, 100, 30));
    if(stg.fs[stg.NF].input!=0){
      for(int i=0; i<stg.NT; i++){
        int j=stg.NF;
        if(stg.fs[j].input==1){
          stg.os.f[i][j] = stg.dt*i < stg.fs[j].t_in ? 0 : stg.fs[j].s_in;
          stg.is.f[i][j] = stg.os.f[i][j];
        }
        if(stg.fs[j].input==2){
          stg.os.f[i][j] = stg.dt*i > stg.fs[j].t_in ? 0 : stg.fs[j].s_in;
          stg.is.f[i][j] = stg.os.f[i][j];
        }
      }
    }
    stg.NF++;
    win.clear();
    win.remove();
  }else if(e.getController().getName().compareTo("factor_remove")==0){
    lf.removeItem(lf.getItem(nlf).getName());
    for(int i=nlf+1; i<stg.NF; i++){
      String tmpName = lf.getItem(nlf).getName();
      lf.removeItem(tmpName);
      lf.addItem(tmpName, i-1);
      lf.getItem(i-1).setColorBackground(pg.color(60, 100, 100, 40));
      stg.fs[i-1] = stg.fs[i];
    }
    stg.NF--;
    nlf = 0;
    if(stg.NF>0){
      lf.getItem(nlf).setColorBackground(pg.color(0, 100, 100, 40));
    }
  }else if(e.getController().getName().compareTo("reflesh")==0){
        stg.reflesh_gc();
    }else if(e.getController().getName().compareTo("run")==0){
          stg.newConstruct(pg, 0);
          stg.simulate();
      }
    }
    
  }
  public void redraw(){
    stg.drawGraph_gc(pg, graph);
  }
  public void draw(){
  //  pg.background(0, 0, 80);
    pg.fill(0, 0, 100);
    pg.stroke(0, 0, 0);
  //  pg.rect(9, 49, 390, 401);
  //  pg.rect(409, 49, 601, 401);
  //  pg.rect(9, 459, 1001, 301);
  //  stg.draw(pg, cnst, graph, 0);
    pg.image(bg, 0, 0);
    pg.image(bone, 100, 80);
    pg.image(bone, 100, 150);
    pg.image(bone, 100, 220);
    pg.image(bone, 100, 290);
  //  pg.image(cnst, 300, 50);
    stg.drawItems(pg, pg.g);
    pg.image(graph, 10, 380);
  }
  public void mousePressed(int mx, int my){
    stg.mousePressed(mx, my);
    redraw();
  }
  public void rightClicked(int mx, int my){
    stg.rightClicked(mx, my);
    redraw();
  }
  public void mouseDragged(int mx, int my){
    stg.mouseDragged(mx, my);
    redraw();
  }
  public void mouseReleased(int mx, int my){
    stg.mouseReleased(mx, my);
    redraw();
  }
}
