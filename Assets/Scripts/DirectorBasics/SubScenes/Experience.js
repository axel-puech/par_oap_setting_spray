//@input SceneObject parent
//@input string[] experiences {"label":"4 expériences"}
//@input Asset.Material hintIntroMat
//@input Asset.Material hintExperienceMat
//@input Asset.Material tapToSprayMat
//@input Asset.Material tapToStopMat

//@input SceneObject openedSpray
//@input float delayBeforeExperienceHint = 1.5

//@input int numberOfTapMax = 20

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

global.orderExperiences = [];
global.currentExperienceIndex = 0;

global.numberOfTapMax = script.numberOfTapMax;
let experienceEnded = false;
let firstTap = false;

let currentNumberOfTap = 0;

const openedSprayImage = script.openedSpray.getComponent("Component.Image");
const openedSprayInteraction = script.openedSpray.getComponent("Component.InteractionComponent");

//________Caller________//
const SprayTappedCaller = script.subScene.CreateCaller("SprayTappedEvent");
const endExperienceCaller = script.subScene.CreateCaller("EndExperienceEvent");

//________Listener________//
const IntroTapListener = script.subScene.CreateListener("IntroTapEvent", IntroTapped);
const WheelAnimEndListener = script.subScene.CreateListener("WheelAnimEndEvent", WheelAnimEnded);
const ExperienceStartListener = script.subScene.CreateListener("ExperienceStartEvent", ExperienceStarted);

//________DelayEvent________//

const FadeInExperienceHintDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeHintExperience.GoTo(1);
  fadeSpray.GoTo(1);
});

//_________________________Director_Functions_____________________//
function Start() {
  // On mélange les indices plutôt que les noms des expériences.
  var experiencesMelangees = [];
  for (var i = 0; i < script.experiences.length; i++) {
    experiencesMelangees.push(i);
  }

  for (var i = experiencesMelangees.length - 1; i > 0; i--) {
    var indexAleatoire = Math.floor(Math.random() * (i + 1));
    var temporaire = experiencesMelangees[i];
    experiencesMelangees[i] = experiencesMelangees[indexAleatoire];
    experiencesMelangees[indexAleatoire] = temporaire;
  }

  global.orderExperiences = experiencesMelangees;
  print(global.orderExperiences.join(", "));
}
function OnLateStart() {}
function Update() {}
function Stop() {
  fadeHintIntro.Reset();
  fadeHintIntro.JumpTo(1);
  fadeHintExperience.Reset();
  fadeSpray.Reset();
  fadeTapToStop.Reset();
  // fadeTapToStop.JumpTo(1);
  currentNumberOfTap = 0;
  experienceEnded = false;
  firstTap = false;
}
//___________________________Functions__________________________//

function WheelAnimEnded() {
  FadeInExperienceHintDelay.event.reset(script.delayBeforeExperienceHint);
}

function IntroTapped() {
  fadeHintIntro.GoTo(0);
  fadeTapToStop.GoTo(0);
}

function ExperienceStarted() {
  fadeTapToStop.GoTo(1);
  currentNumberOfTap = 0;
  experienceEnded = false;
  firstTap = false;
}

//___________________________Buttons__________________________//

openedSprayInteraction.onTouchStart.add(function () {
  if (currentNumberOfTap >= script.numberOfTapMax) {
    print("Max taps reached");
    if (!experienceEnded) {
      fadeSpray.GoTo(0);
      endExperienceCaller.Call();
      experienceEnded = true;
    }
    return;
  }
  if (!firstTap) {
    fadeHintExperience.GoTo(0);
    firstTap = true;
  }
  print("Tap_Example");
  SprayTappedCaller.Call();
  currentNumberOfTap++;
});

//___________________________Animations_________________________//

//_________________Hints/Spray_______________//

const fadeHintIntro = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.hintIntroMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});

const fadeHintExperience = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.hintExperienceMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
  script.tapToSprayMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});

const fadeSpray = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  openedSprayImage.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});

const fadeTapToStop = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.tapToStopMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});
