package genenetworkgamecore;

import genenetworkgamecore.GUI;
import processing.core.*;
import controlP5.*;
import java.io.*;
import java.util.*;

public class GUI_Stage extends GUI{
  int NStage;
  String[] stageName;
  String[][] desc;
  PImage bg;
  PImage nonstg;
  PImage stgimg;
  GUI_Stage(GeneNetworkGameCore pg0){
    pg = pg0;
    bg = pg.loadImage("../data/imgs/background_select.png");
    stgimg = pg.loadImage("../data/imgs/nonstg.png");
    
    File fle = new File("../data/stages/stagelist.txt");
    Scanner scan = null;
    try {
      scan = new Scanner(fle);
    } catch (FileNotFoundException e) {
      System.out.println(e);
    }
    scan.useDelimiter("\\n");
    
    String ln = null;
    while(scan.hasNext()){
      ln = scan.next();
      if(ln.charAt(0)!='#') break;
    }
    NStage = Integer.parseInt(ln);
    stageName = new String[NStage];
    desc = new String[NStage][3];
    
    for(int i=0; i<NStage; i++){
      while(scan.hasNext()){
        ln = scan.next();
        if(ln.charAt(0)!='#') break;
      }
      stageName[i] = ln;
      
      for(int j=0; j<3; j++){
        ln = scan.next();
        System.out.println(i+" "+j+" "+ln);
        desc[i][j] = ln;
      }
    }
    
    pg = pg0;
    cp5 = new ControlP5(pg);
    cp5.setFont(pg.loadFont("../data/fonts/Futura.vlw"), 12);
    cp5.setColorBackground(pg.color(60, 100, 50));
/*    cp5.setColorForeground(pg.color(60, 50, 100));
    cp5.setColorBackground(pg.color(60, 10, 100));
    cp5.setFont(pg.loadFont("Monospaced-48.vlw"), 12);
    cp5.setColorCaptionLabel(pg.color(0, 0, 0));*/
    cp5.addButton("title")
      .setPosition(100, 490)
      .setSize(120, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    for(int i=0; i<NStage; i++){
      cp5.addButton(stageName[i])
      .setPosition(100, i*40+60)
      .setSize(120, 30)
      .getCaptionLabel().align(pg.CENTER,pg.CENTER)
      ;
    }
  }
  public void draw(){
    pg.image(bg, 0, 0);
    pg.fill(64, 100, 100, 40);
    pg.rect(290, 60, 510, 360);
    pg.image(stgimg, 290, 60, 510, 360);
    pg.rect(290, 440, 510, 80);
    pg.fill(100);
    for(int i=0; i<NStage; i++){
      if(pg.mouseX>100 && pg.mouseX<220 && pg.mouseY>i*40+60 && pg.mouseY<i*40+90){
        stgimg = pg.loadImage("../data/imgs/"+stageName[i]+".png");
        pg.image(stgimg, 290, 60, 510, 360);
        for(int j=0; j<3; j++){
          pg.textFont(pg.loadFont("../data/fonts/Futura.vlw"), 15);
          pg.text(desc[i][j], 300, 460+j*20);
        }
      }
    }
  }
  public void event(ControlEvent e){
    if(e.getController().getName().compareTo("title")==0){
      pg.toTitle();
    }
    for(int i=0; i<NStage; i++){
      if(e.getController().getName().compareTo(stageName[i])==0){
        pg.toGame(stageName[i], desc[i]);
      }
    }
  }

}
