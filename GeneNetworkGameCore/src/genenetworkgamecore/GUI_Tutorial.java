package genenetworkgamecore;

import genenetworkgamecore.GUI;
import processing.core.*;
import controlP5.*;

public class GUI_Tutorial extends GUI{
  PImage logo, teamlogo, bg, tutorial;
  String[] imgName = {
      "gng_tutorial_dna_1.png",
      "gng_tutorial_dna_2.png",
      "gng_tutorial_tf.png",
      "gng_tutorial_construct.png",
      "gng_tutorial_dynamics.png",
      "gng_tutorial_game_1.png",
      "gng_tutorial_game_2.png",
      "gng_tutorial_game_3.png",
      "gng_tutorial_editor_1.png",
      "gng_tutorial_editor_2.png",
      "gng_tutorial_editor_3.png",
      "gng_tutorial_model_1.png",
      "gng_tutorial_model_2.png",
      "gng_tutorial_model_3.png",
  };
  int page;
  void addb(String str, int x, int y, int w, int h, int c){
    cp5.addButton(str)
    .setPosition(x, y)
    .setSize(w, h)
    .getCaptionLabel().align(pg.CENTER,pg.CENTER)
    ;
    cp5.getController(str).setColorBackground(pg.color(c, 100, 50));
    if(c!=70){
      cp5.getController(str).setColorForeground(pg.color(c, 100, 50));
      cp5.getController(str).setColorActive(pg.color(c, 100, 50));
    }
    
  }
  GUI_Tutorial(GeneNetworkGameCore pg0){
    pg = pg0;
    cp5 = new ControlP5(pg);
    cp5.setFont(pg.loadFont("data/fonts/Futura.vlw"), 12);
    cp5.setColorBackground(pg.color(60, 100, 50));
    logo = pg.loadImage("data/imgs/logo.png");
    teamlogo = pg.loadImage("data/imgs/teamlogo.png");
    bg = pg.loadImage("data/imgs/background_guide.png");
    page = 0;
    tutorial = pg.loadImage("data/imgs/"+imgName[0]);
    /*
    cp5.addTextlabel("label")
      .setText("Gene Network Game")
      .setPosition(pg.width/2, pg.height/2)
      .setColorValue(pg.color(100,100,100))
      .setFont(pg.createFont("Serif", 20))
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
      */
    addb("INDEX",           725, 25, 150, 30, 0);
    addb("Background",      725, 65, 150, 30, 50);  
    addb("DNA",   725, 95, 150, 30, 70);
    addb("TF",   725, 125, 150, 30, 70);
    addb("Construct",       725, 155, 150, 30, 70);
    addb("Dynamics",        725, 185, 150, 30, 70);
//    addb("iGEM & gene net", 725, 185, 150, 30, 70);
    addb("guide(game)",     725, 240, 150, 30, 50);
    addb("Instructions",           725, 270, 150, 30, 70);
//    addb("advanced",        725, 285, 150, 30, 70);
    addb("guide(editor)",   725, 325, 150, 30, 50);
    addb("instructions",        725, 355, 150, 30, 70);
    addb("Model",       725, 385, 150, 30, 70);
//    addb("genes",           725, 415, 150, 30, 70);
//    addb("sample",          725, 445, 150, 30, 70);
    addb("back",            725, 545, 150, 30, 70);

    addb("previous",            500, 545, 100, 30, 70);
    addb("next",            610, 545, 100, 30, 70);
  }
  public void draw(){
    pg.background(100);
    pg.background(0);
    pg.image(bg, 0, 0);
    pg.image(tutorial, 26, 35);
  }
  public void event(ControlEvent e){
    if(e.getController().getName().compareTo("back")==0){
      pg.toTitle();
    }else if(e.getController().getName().compareTo("next")==0){
      if(page<13) page++;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("previous")==0){
      if(page>0) page--;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("DNA")==0){
      page = 0;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("TF")==0){
      page = 2;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("Construct")==0){
      page = 3;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("Dynamics")==0){
      page = 4;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("Instructions")==0){
      page = 5;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("instructions")==0){
      page = 8;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }else if(e.getController().getName().compareTo("Model")==0){
      page = 11;
      tutorial = pg.loadImage("data/imgs/"+imgName[page]);
    }
  }

}
