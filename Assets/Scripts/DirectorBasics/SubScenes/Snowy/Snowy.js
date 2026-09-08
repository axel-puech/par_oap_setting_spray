//@input SceneObject parent
//@input Asset.Material snowMaterial
//@input vec2 minMaxWindForce
//@input float snowForceDuration = 0.5
//@input float snowOpacityExponentialStrength = 2.0

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let incrementByTap = 0;
let currentSnowForce = script.minMaxWindForce.y;
let displayedSnowForce = currentSnowForce;
let snowForceAnimationStart = currentSnowForce;
const minSnowForce = script.minMaxWindForce.x;
let sprayTapCount = 0;

//________Caller________//
//________Listener________//
const SprayTappedListener = script.subScene.CreateListener("SprayTappedEvent", OnSprayTapped);
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  incrementByTap = (script.minMaxWindForce.x - script.minMaxWindForce.y) / global.numberOfTapMax;
  print("incrementByTap: " + incrementByTap);
  ResetSnowForce();
  ResetSnowOpacity();
}
function OnLateStart() {
  animFadeSnow.GoTo(1);
}
function Update() {}
function Stop() {
  animFadeSnow.Reset();
  ResetSnowForce();
  ResetSnowOpacity();
}
//___________________________Functions__________________________//

function OnSprayTapped() {
  // La force commence au maximum (y) et décroît progressivement jusqu'au minimum (x).
  // Repartir de la valeur affichée évite un saut si le joueur tape pendant l'animation.
  snowForceAnimationStart = displayedSnowForce;
  currentSnowForce = Math.max(currentSnowForce + incrementByTap, minSnowForce);
  animSnowForce.duration = Math.max(0.01, script.snowForceDuration);
  animSnowForce.Reset();
  animSnowForce.GoTo(1);

  sprayTapCount = Math.min(sprayTapCount + 1, global.numberOfTapMax);
  SetSnowOpacityFromTapProgress();
}

function SetSnowForce(force) {
  displayedSnowForce = force;
  script.snowMaterial.mainPass.forceX = displayedSnowForce;
}

function ResetSnowForce() {
  currentSnowForce = script.minMaxWindForce.y;
  snowForceAnimationStart = currentSnowForce;
  SetSnowForce(currentSnowForce);
  animSnowForce.Reset();
}

function SetSnowOpacityFromTapProgress() {
  const tapProgress = sprayTapCount / global.numberOfTapMax;
  const strength = Math.max(0.001, script.snowOpacityExponentialStrength);
  const exponentialProgress = (Math.exp(strength * tapProgress) - 1) / (Math.exp(strength) - 1);
  script.snowMaterial.mainPass.alphaStart = 1 - exponentialProgress;
}

function ResetSnowOpacity() {
  sprayTapCount = 0;
  script.snowMaterial.mainPass.alphaStart = 1;
}

//___________________________Animations_________________________//

const animFadeSnow = new Animation(script.getSceneObject(), 1.5, (ratio) => {
  script.snowMaterial.mainPass.alphaStart = ratio;
});

const animSnowForce = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  SetSnowForce(snowForceAnimationStart + (currentSnowForce - snowForceAnimationStart) * ratio);
});

// animSnowForce.Easing = QuadraticInOut;
