//@input SceneObject parent
//@input Asset.Material rainMaterial
//@input vec2 minMaxWindForce
//@input float rainForceDuration = 0.5
//@input float rainOpacityExponentialStrength = 2.0

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let incrementByTap = 0;
let currentRainForce = script.minMaxWindForce.y;
let displayedRainForce = currentRainForce;
let rainForceAnimationStart = currentRainForce;
const minRainForce = script.minMaxWindForce.x;
let sprayTapCount = 0;

//________Caller________//
//________Listener________//
const SprayTappedListener = script.subScene.CreateListener("SprayTappedEvent", OnSprayTapped);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  incrementByTap = (script.minMaxWindForce.x - script.minMaxWindForce.y) / global.numberOfTapMax;
  print("incrementByTap: " + incrementByTap);
  ResetRainForce();
  ResetRainOpacity();
}
function OnLateStart() {
  animFadeRain.GoTo(1);
}
function Update() {}
function Stop() {
  animFadeRain.Reset();
  ResetRainForce();
  ResetRainOpacity();
}
//___________________________Functions__________________________//

function OnSprayTapped() {
  // La force commence au maximum (y) et décroît progressivement jusqu'au minimum (x).
  // Repartir de la valeur affichée évite un saut si le joueur tape pendant l'animation.
  rainForceAnimationStart = displayedRainForce;
  currentRainForce = Math.max(currentRainForce + incrementByTap, minRainForce);
  animRainForce.duration = Math.max(0.01, script.rainForceDuration);
  animRainForce.Reset();
  animRainForce.GoTo(1);

  sprayTapCount = Math.min(sprayTapCount + 1, global.numberOfTapMax);
  SetRainOpacityFromTapProgress();
}

function SetRainForce(force) {
  displayedRainForce = force;
  script.rainMaterial.mainPass.forceX = displayedRainForce;
}

function ResetRainForce() {
  currentRainForce = script.minMaxWindForce.y;
  rainForceAnimationStart = currentRainForce;
  SetRainForce(currentRainForce);
  animRainForce.Reset();
}

function SetRainOpacityFromTapProgress() {
  const tapProgress = sprayTapCount / global.numberOfTapMax;
  const strength = Math.max(0.001, script.rainOpacityExponentialStrength);
  const exponentialProgress = (Math.exp(strength * tapProgress) - 1) / (Math.exp(strength) - 1);
  script.rainMaterial.mainPass.alphaStart = 1 - exponentialProgress;
}

function ResetRainOpacity() {
  sprayTapCount = 0;
  script.rainMaterial.mainPass.alphaStart = 1;
}

//___________________________Animations_________________________//
const animFadeRain = new Animation(script.getSceneObject(), 1.5, (ratio) => {
  script.rainMaterial.mainPass.alphaStart = ratio;
});

const animRainForce = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  SetRainForce(rainForceAnimationStart + (currentRainForce - rainForceAnimationStart) * ratio);
});
