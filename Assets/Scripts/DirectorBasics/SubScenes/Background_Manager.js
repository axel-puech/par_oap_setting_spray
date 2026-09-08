//@input SceneObject parent
//@ui {"widget":"label", "label":"BACKGROUND SETTINGS"}
//@ui {"widget":"separator"}
//@input Asset.Material backgroundMat
//@input vec2 minMaxYRatio
//@input float incrementByTap
//@input float backgroundFillDuration = 0.5
//@input Asset.Texture[] texturesBackground

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let incrementByTap = script.incrementByTap;

let currentYRatio = script.minMaxYRatio.x;
const maxCurrentYRatio = script.minMaxYRatio.y;
let displayedYRatio = currentYRatio;
let backgroundAnimationStart = currentYRatio;
let hasReachedBackgroundMax = false;

//________Caller________//
//________Listener________//

const RestartListener = script.subScene.CreateListener("RestartEvent", OnRestart);

const SprayTappedListener = script.subScene.CreateListener("SprayTappedEvent", OnSprayTapped);
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  script.backgroundMat.mainPass.baseTex =
    script.texturesBackground[global.orderExperiences[global.currentExperienceIndex]];
  incrementByTap = (script.minMaxYRatio.y - script.minMaxYRatio.x) / global.numberOfTapMax;
  print("incrementByTap: " + incrementByTap);
  ResetBackgroundFill();
  fadeBackground.JumpTo(1);
}

function OnLateStart() {}
function Update() {}
function Stop() {
  ResetBackgroundFill();
}
//___________________________Functions__________________________//

function OnRestart() {
  fadeBackground.GoTo(0);
}

function OnSprayTapped() {
  // On repart de la valeur réellement affichée : un tap pendant l'animation
  // précédente reste donc parfaitement fluide.
  backgroundAnimationStart = displayedYRatio;
  currentYRatio = Math.min(currentYRatio + incrementByTap, maxCurrentYRatio);
  if (!hasReachedBackgroundMax && currentYRatio >= maxCurrentYRatio) {
    hasReachedBackgroundMax = true;
    print("Background fill reached maximum");
  }
  fadeBackgroundReveal.duration = Math.max(0.01, script.backgroundFillDuration);
  fadeBackgroundReveal.Reset();
  fadeBackgroundReveal.GoTo(1);
}

function SetBackgroundFill(yRatio) {
  displayedYRatio = yRatio;
  script.backgroundMat.mainPass.yRatio = displayedYRatio;
}

function ResetBackgroundFill() {
  currentYRatio = script.minMaxYRatio.x;
  backgroundAnimationStart = currentYRatio;
  hasReachedBackgroundMax = false;
  SetBackgroundFill(currentYRatio);
  fadeBackgroundReveal.Reset();
  fadeBackground.Reset();
}

//___________________________Animations_________________________//

//_________________Background_______________//

const fadeBackgroundReveal = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  SetBackgroundFill(backgroundAnimationStart + (currentYRatio - backgroundAnimationStart) * ratio);
});

fadeBackgroundReveal.Easing = QuadraticOut;

const fadeBackground = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.backgroundMat.mainPass.alphaRatio = ratio;
});
