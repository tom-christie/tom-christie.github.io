//when using in simulation, 
//each lookahead "step" should be like 10-30 simulation steps

//want a point equilibrium
//height of equilibrium could be a measure of individual differences

//dn1/dt = r1*n1 − a1*n1*n2
//dn2/dt = −r2*n2 + a2*n1*n2


float[] state_trajectory;
float[] control_trajectory;
float energy_steady_state;
float time_scale;
float a, b, c, d, gamma;
float e, mu, r, alpha;
float control, energy, min_control, min_energy;


void setup() {
  size(800, 500);
  energy_steady_state = 10;
  energy = 1;
  control = 1;
  min_control = 0.1;
  min_energy = 0.01;



  state_trajectory = new float[width];
  control_trajectory = new float[width];
  for (int i=0; i<width; i++) {
    state_trajectory[i] = energy;
  }

  for (int i=0; i<width; i++) {
    control_trajectory[i] = control;
  }
};

void draw() {

//    a = 6.3; //regeneration rate of energy
//    b = 9.3; //how much control costs
//    c = 6.0; //how much control is exerted (1-2 is reasonable)
//    d = 1.0;
//    gamma = 3.80;

  //A-G model
  e = 0.3;//prey -> predator conversion efficiency 
  mu = 0.2;//food-independent predator mortality
  r = 1.6;//prey regeneration rate
  alpha = 0.06;//predator regeneration rate?  slope of log function
  time_scale = 0.10;//10.95;
  
  //calculate next step
  float attempted_control = 3 * (float(height)-float(mouseY)) / float(height);
  alpha = attempted_control;
  println("alpha " + attempted_control);
  control += control_step();
  if(control < min_control) control = min_control;
  if(energy < min_energy) energy = min_energy;
  energy += energy_step();

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
  for (int i=0; i<width; i++) point(i, height - 29*state_trajectory[i]);
  stroke(0, 255, 0);
  for (int i=0; i<width; i++) point(i, height - 38*control_trajectory[i]);

  println("energy " + energy);
  println("control " + control);
  ////  println(trajectory[width-1]);
};

float energy_step() {

  float recent_energy = state_trajectory[width-1];
  float recent_control = control_trajectory[width-1];
  //this is a*R*(1-R/K) - b*R*N;  
  //float result = a * recent_energy * (1 - recent_energy/energy_steady_state) - b * recent_energy * _control;
  
  //dn1/dt = r1*n1 − a1*n1*n2
  //dn2/dt = −r2*n2 + a2*n1*n2
  //float result = a * recent_energy - b * recent_energy * _control;
  
  
  //Michaelis-Menten function
  //float result = a * recent_energy * (1 - recent_energy/energy_steady_state) - (b * recent_energy * recent_control)/(1 + gamma * recent_energy);
  //println();
  //println("what1a " + recent_energy + " " + recent_control  + " " + result);
  //println("what1b " + a * recent_energy * (1 - recent_energy/energy_steady_state) + " " + (b * recent_energy * recent_control)/(1 + gamma * recent_energy));
  
  //A-G model
  float result = f() * recent_energy - g() * recent_control;  
  
  return result * time_scale;
}

float control_step() {
  //control itself has dynamics - operates as a lag
  //limited by current control, attempted new control
  //and energy resources
  float recent_energy = state_trajectory[width-1];
  float recent_control = control_trajectory[width-1];
  //this is c*a*R*N - d*N;
  //  return _control * a * control_trajectory[width-1] * state_trajectory[width-1] - d * control_trajectory[width-1];

//dn1/dt = r1*n1 − a1*n1*n2
//dn2/dt = −r2*n2 + a2*n1*n2  <- a2 is ATTEMPTED CONTROL
  //float result = - d * control_trajectory[width-1] + c * control_trajectory[width-1] * state_trajectory[width-1] + _control;

  //Michaelis-Menten function
  //float result = (c * recent_energy * recent_control)/(1 + gamma * recent_energy) - d*recent_control;  
  //println();
  //println("what2a " + (c * recent_energy * recent_control)/(1 + gamma * recent_energy) + " " + d*recent_control + " " + result);
  
  //A-G model
   float result = e * g() * recent_energy - mu * recent_control;
 
  return result * time_scale;
}

float f(){
  // f(N) - per capita rate increase of prey in absence of predators
  float recent_energy = state_trajectory[width-1];
  float result =  r * (1 - recent_energy/energy_steady_state);
  return result;
}

float g(){
  // g(N/P)
  //amt of prey consumed per predator per unit time
  //log because apparently it needs to be convex increasing with ratio of predator to prey
  
  float recent_energy = state_trajectory[width-1];
  float recent_control = control_trajectory[width-1];
  float result = log(alpha * recent_energy/recent_control + 1);
  return result;
  
}

