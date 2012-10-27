package genenetworkgamecore;

import genenetworkgamecore.GUI;
import processing.core.*;
import controlP5.*;

public class GUI_Title extends GUI{
  PImage logo, teamlogo, bg;
  GUI_Title(GeneNetworkGameCore pg0){
    pg = pg0;
    cp5 = new ControlP5(pg);
    cp5.setFont(pg.loadFont("data/fonts/Futura.vlw"), 12);
    cp5.setColorBackground(pg.color(60, 100, 50));
    logo = pg.loadImage("data/imgs/logo.png");
    teamlogo = pg.loadImage("data/imgs/teamlogo.png");
    bg = pg.loadImage("data/imgs/background_select.png");
    /*
    cp5.addTextlabel("label")
      .setText("Gene Network Game")
      .setPosition(pg.width/2, pg.height/2)
      .setColorValue(pg.color(100,100,100))
      .setFont(pg.createFont("Serif", 20))
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
      */
    cp5.addButton("stage editor")
      .setPosition(pg.width/2+70, pg.height*2/3)
      .setSize(100, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    cp5.addButton("stage select")
    .setPosition(pg.width/2-50, pg.height*2/3)
    .setSize(100, 30)
    .getCaptionLabel().align(pg.CENTER,pg.CENTER)
    ;
    cp5.addButton("tutorial")
    .setPosition(pg.width/2-170, pg.height*2/3)
    .setSize(100, 30)
    .getCaptionLabel().align(pg.CENTER,pg.CENTER)
    ;
    
    hue = new float[50][40];
    theta = new float[50][40];
    dth = new float[50][40];
    for(int i=0; i<1000; i+=20){
      for(int j=0; j<800; j+=20){
        hue[i/20][j/20] = pg.random(0, 50);
        theta[i/20][j/20] = pg.random(0, 2*3.1415f);
        dth[i/20][j/20] = pg.random(0.02f, 0.08f);
      }
    }
  }
  float[][] hue, theta, dth;
  public void draw(){
//    pg.image(bg, 0, 0);
    pg.background(100);
    pg.background(0);
    for(int i=0; i<1000; i+=20){
      for(int j=0; j<800; j+=20){
        pg.noStroke();
        pg.fill(hue[i/20][j/20], 100, 30*(1+(float)Math.sin(theta[i/20][j/20])));
        theta[i/20][j/20] += dth[i/20][j/20];
        pg.ellipse(i, j, 10, 10);
      }
    }

    pg.image(logo, 225, 100);
    pg.image(teamlogo, 680, 500);
  }
  public void event(ControlEvent e){
    if(e.getController().getName().compareTo("stage editor")==0){
      pg.toGC();
    }else if(e.getController().getName().compareTo("stage select")==0){
      pg.toStage();
    }else if(e.getController().getName().compareTo("tutorial")==0){
      pg.toTutorial();
    }
  }

}
