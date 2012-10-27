package genenetworkgamecore;

import genenetworkgamecore.GUI;
import genenetworkgamecore.Stage.*;
import processing.core.*;
import controlP5.*;

public class GUI_Game extends GUI{
  PGraphics graph;
  PImage bg, bone;
  Stage stg;
  ListBox lp, lf;
  int nlp, nlf;
  String stgName;
  String[] desc;
  
  GUI_Game(GeneNetworkGameCore pg0, String stageFile, String[] desc_){
    stgName = stageFile;
    desc = desc_;
    pg = pg0;
//    cnst = pg.createGraphics(1000, 400, pg.P2D);
    graph = pg.createGraphics(660, 210, pg.P2D);
    bg = pg.loadImage("data/imgs/background.png");
    bone = pg.loadImage("data/imgs/bone.png");
//    cnst.colorMode(pg.HSB, 100);
    graph.colorMode(pg.HSB, 100);
    nlp = 0;
    nlf = 0;
    stg = new Stage();
    cp5 = new ControlP5(pg);
    cp5.setFont(pg.loadFont("data/fonts/Futura.vlw"), 12);
    cp5.setColorBackground(pg.color(60, 100, 50));
    
    cp5.addButton("title")
      .setPosition(10, 10)
      .setSize(100, 20)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    cp5.addButton("stage select")
    .setPosition(120, 10)
    .setSize(100, 20)
    .getCaptionLabel().align(pg.CENTER,pg.CENTER)
    ;
    cp5.addButton("guide")
    .setPosition(240, 10)
    .setSize(100, 20)
    .getCaptionLabel().align(pg.CENTER,pg.CENTER)
    ;
    
    cp5.addButton("reset")
      .setPosition(720, 550)
      .setSize(160, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    cp5.addButton("run")
      .setPosition(720, 500)
      .setSize(160, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    stg = new Stage();
    stg.initialize_stage();
    stg.loadFile(stageFile+".txt");
    stg.refresh_game();
  }
  public void event(ControlEvent e){
    if(e.isController()){
      if(e.getController().getName().compareTo("title")==0){
        pg.toTitle();
      }else if(e.getController().getName().compareTo("stage select")==0){
        pg.toStage();
      }else if(e.getController().getName().compareTo("description")==0){
        win = cp5.addControlWindow("descWindow", 140, 200, 700, 200);
        win.hideCoordinates();
//        win.toggleUndecorated();
        win.setTitle("Description");
        cp5.addTextlabel("title")
        .setText(stgName)
        .setPosition(280, 20)
        .setSize(200, 30)
        .setColorValue(pg.color(100))
        .setFont(pg.createFont("Georgia", 25))
        .setWindow(win)
        ;
        cp5.addTextlabel("d1")
          .setText(desc[0])
          .setPosition(10, 70)
          .setSize(680, 20)
          .setColorValue(pg.color(100))
          .setFont(pg.createFont("Georgia", 15))
          .setWindow(win)
          ;
        cp5.addTextlabel("d2")
        .setText(desc[1])
        .setPosition(10, 90)
        .setSize(680, 20)
        .setColorValue(pg.color(100))
        .setFont(pg.createFont("Georgia", 15))
        .setWindow(win)
        ;
        cp5.addTextlabel("d3")
        .setText(desc[2])
        .setPosition(10, 110)
        .setSize(680, 20)
        .setColorValue(pg.color(100))
        .setFont(pg.createFont("Georgia", 15))
        .setWindow(win)
        ;
        cp5.addButton("OK")
        .setLabel("OK")
        .setPosition(320, 160)
        .setSize(60, 30)
        .setWindow(win)
        ;
        
      }else if(e.getController().getName().compareTo("reset")==0){
        stg.refresh_game();
      }else if(e.getController().getName().compareTo("run")==0){
            stg.newConstruct(pg, 1);
            stg.simulate();
      }else if(e.getController().getName().compareTo("continue")==0){
        stg.simFlag=0;
        win.clear();
        win.remove();
      }else if(e.getController().getName().compareTo("stage select2")==0){
        win.clear();
        win.remove();
        pg.toStage();
      }else if(e.getController().getName().compareTo("OK")==0){
        win.clear();
        win.remove();
      }else if(e.getController().getName().compareTo("guide")==0){
        pg.toTutorial();
      }
    }
    
  }
  public void redraw(){
//    pg.background(0, 0, 80);
    pg.fill(0, 0, 100);
    pg.stroke(0, 0, 0);
//    pg.rect(9, 49, 390, 401);
//    pg.rect(409, 49, 601, 401);
//    pg.rect(9, 459, 1001, 301);
//    stg.draw(pg, cnst, graph, 1);
    pg.image(bg, 0, 0);
    pg.image(bone, 100, 80);
    pg.image(bone, 100, 150);
    pg.image(bone, 100, 220);
    pg.image(bone, 100, 290);
    stg.drawItems(pg, pg.g);
    stg.drawGraph(pg, graph);
//    pg.image(cnst, 10, 50);
    pg.image(graph, 20, 370);
  }
  public void draw(){
    redraw();
    if(stg.simFlag==stg.NT){
      stg.simFlag=0;
      if(stg.isCorrect()==0){
        win = cp5.addControlWindow("WrongWindow", 300, 200, 300, 200);
        win.hideCoordinates();
//        win.toggleUndecorated();
        win.setTitle("Wrong Answer!");
        cp5.addTextlabel("Wrong")
          .setText("Wrong!")
          .setPosition(110, 50)
          .setSize(100, 30)
          .setColorValue(pg.color(100))
          .setFont(pg.createFont("Georgia", 20))
          .setWindow(win)
          ;
        cp5.addButton("continue")
        .setLabel("continue")
        .setPosition(100, 100)
        .setSize(100, 30)
        .setWindow(win)
        ;
      }else{
        win = cp5.addControlWindow("CorrectWindow", 300, 200, 300, 200);
        win.hideCoordinates();
//        win.toggleUndecorated();
        win.setTitle("Stage Clear!");
        cp5.addTextlabel("Correct")
          .setText("Congraturations!")
          .setPosition(70, 50)
          .setSize(100, 30)
          .setColorValue(pg.color(100))
          .setFont(pg.createFont("Georgia", 20))
          .setWindow(win)
          ;
        cp5.addButton("stage select2")
        .setLabel("stage select")
        .setPosition(100, 100)
        .setSize(100, 30)
        .setWindow(win)
        ;
      }
    }
  }
  public void mousePressed(int mx, int my){
    stg.mousePressed(mx, my);
    redraw();
  }
  public void rightClicked(int mx, int my){
//    stg.rightClicked(mx-10, my-50);
  }
  public void mouseDragged(int mx, int my){
    stg.mouseDragged(mx, my);
  }
  public void mouseReleased(int mx, int my){
    stg.mouseReleased(mx, my);
  }
}
