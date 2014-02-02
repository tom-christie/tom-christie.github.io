/**
 * Esfera
 * by David Pena.  
 * 
 * Distribucion aleatoria uniforme sobre la superficie de una esfera. 
 */

import processing.opengl.*;

int number = 250;
pelo[] lista ;
float[] z = new float[number]; 
float[] phi = new float[number]; 
float[] largos = new float[number]; 
float radius = 100;
float rx = 0;
float ry =0;

void setup() {
  size(1024, 768, OPENGL);
  radius = height/3.5;
  
  lista = new pelo[number];
  for (int i=0; i<number; i++){
    lista[i] = new pelo();
  }
  noiseDetail(3);

}

void draw() {
  background(255);
  translate(width/2,height/2);

  float rxp = ((mouseX-(width/2))*0.005);
  float ryp = ((mouseY-(height/2))*-0.005);
  rx = (rx*0.9)+(rxp*0.1);
  ry = (ry*0.9)+(ryp*0.1);
  rotateY(rx);
  rotateX(ry);
//  fill(0);
  //noStroke();
  //sphere(radius);


  for (int i=0;i<number;i++){
    lista[i].skwtch();

  }
  
  
}


class pelo
{
  float z = random(-radius,radius);
  float phi = random(TWO_PI);
  //float largo = random(1.15,1.2);
  float theta = asin(z/radius);

    void skwtch(){
//
//    float off = (noise(millis() * 0.0005,sin(phi))-0.5) * 0.3;
//    float offb = (noise(millis() * 0.0007,sin(z) * 0.01)-0.5) * 0.3;
//
//    float thetaff = theta+off;
//    float phff = phi+offb;

    float x = radius * cos(theta) * cos(phi);
    float y = radius * cos(theta) * sin(phi);
    float z = radius * sin(theta);
    float msx= screenX(x,y,z);
    float msy= screenY(x,y,z);
//
//    float xo = radius * cos(thetaff) * cos(phff);
//    float yo = radius * cos(thetaff) * sin(phff);
//    float zo = radius * sin(thetaff);
//
//    float xb = xo * largo;
//    float yb = yo * largo;
//    float zb = zo * largo;
//    
//    beginShape(LINES);
//    stroke(0);
//    vertex(x,y,z);
//    stroke(200,150);
//    vertex(xb,yb,zb);
//    endShape();
    point(x,y,z);
    strokeWeight(4);
    line(x,y,z,x+2,y+2,z+2);
    
  }
}

