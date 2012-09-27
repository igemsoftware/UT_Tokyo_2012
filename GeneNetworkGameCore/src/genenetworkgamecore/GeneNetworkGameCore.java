package genenetworkgamecore;

import processing.core.PApplet;
import java.util.*;
import java.io.*;
import controlP5.*;

public class GeneNetworkGameCore extends PApplet {
    Stage stg;
    GUI gui;
  
	public void setup() {
//	  stg = new Stage("stage0.txt");
	  size(900, 600);
	  colorMode(HSB, 100);
	  background(100);
	  frameRate(20);
	  
	  gui = new GUI_Title(this);
	}

	public void draw() {
	  background(100);
//	  stg.draw(this.g);
	  gui.draw();
	}
	
	public void mouseClicked(){
      if(mouseButton==RIGHT) gui.rightClicked(mouseX, mouseY);
	}
	public void mousePressed(){
	  gui.mousePressed(mouseX, mouseY);
	}

    public void mouseReleased(){
      gui.mouseReleased(mouseX, mouseY);
    }
	public void mouseDragged(){
      gui.mouseDragged(mouseX, mouseY);
//	  stg.mouseDragged(this);
	}
	
	public void keyPressed(){
	  if(key=='c'){
//	    stg.newConstruct(this);
//	    stg.simulate();
	  }
	}
	public void controlEvent(ControlEvent theEvent){
	  gui.event(theEvent);
	}
	
	// transient
	public void toGC(){
      gui.cp5.hide();
      gui = new GUI_GameCreator(this);
	}
    public void toTitle() {
      gui.cp5.hide();
      gui = new GUI_Title(this);
    }
    public void toStage(){
      gui.cp5.hide();
      gui = new GUI_Stage(this);
    }
    public void toGame(String fn, String[] desc){
      gui.cp5.hide();
      gui = new GUI_Game(this, fn, desc);
    }
  
}
