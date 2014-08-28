
float[] state_trajectory;
float[] control_trajectory;
float energy_steady_state;
float time_scale;
float a, b, d;
float control, energy;
//C is CONTROL


void setup() {
  size(800, 500);
  energy_steady_state = 250;
  energy = 100;
  time_scale = 0.1;
  control = 0.1;

  a = 0.05;
  b = 0.1;
  d = 0.1;



  state_trajectory = new float[width];
  control_trajectory = new float[width];
  for (int i=0; i<width; i++) {
    state_trajectory[i] = energy_steady_state;
  }

  for (int i=0; i<width; i++) {
    control_trajectory[i] = control;
  }
};

void draw() {


  //calculate next step
  float attempted_control = (float(height)-float(mouseY)) / float(height)/20;
  println("attempted control " + attempted_control);
  control += control_step(attempted_control);

  energy += energy_step(control);

  //draw
  background(0);
  strokeWeight(4);
  for (int i=0; i<width-1; i++) {
    state_trajectory[i] = state_trajectory[i+1];
    control_trajectory[i] = control_trajectory[i+1];
  }
  state_trajectory[width-1] = energy;
  control_trajectory[width-1] = control;

  stroke(255, 0, 0);
  for (int i=0; i<width; i++) point(i, height - state_trajectory[i]);
  stroke(0, 255, 0);
  for (int i=0; i<width; i++) point(i, height - 200*control_trajectory[i]);

  //  println("energy " + energy);
  //  println("control " + control);
  ////  println(trajectory[width-1]);
};

float energy_step(float _control) {

  //this is a*R*(1-R/K) - b*R*N;
  float recent_energy = state_trajectory[width-1];
  float result = a * recent_energy * (1 - recent_energy/energy_steady_state) - b * recent_energy * _control;
  println("energy step result " + result);
  return a * recent_energy * (1 - recent_energy/energy_steady_state) - b * recent_energy * control;
}

float control_step(float _control) {
  //control itself has dynamics - operates as a lag
  //limited by current control, attempted new control
  //and energy resources

  //this is c*a*R*N - d*N;
  
  return _control * a * control_trajectory[width-1] * state_trajectory[width-1] - d * control_trajectory[width-1];
}


