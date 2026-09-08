//@input SceneObject parent

//@input SceneObject wheelParent
//@input float offsetYWheel
//@input SceneObject wheelRotation

//@input float continuousSpinSpeed = 180.0 {"label":"Vitesse continue (deg/s)"}
//@input int targetCase = 0 {"label":"Case d'arrivee (0-4)","widget":"combobox","values":[{"label":"Case 0","value":0},{"label":"Case 1","value":1},{"label":"Case 2","value":2},{"label":"Case 3","value":3},{"label":"Random","value":4}]}
//@input int fullTurns = 5 {"label":"Nombre de tours"}
//@input float spinDuration = 4.0 {"label":"Duree du spin"}
//@input float case0StopAngle = 0.0 {"label":"Angle d'arret case 0"}
//@input bool clockwise = true {"label":"Rotation horaire"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const wheelParentTransform = script.wheelParent.getComponent("Component.ScreenTransform");
const wheelRotationTransform = script.wheelRotation.getTransform();
const originalPos2D = wheelParentTransform.anchors.getCenter();
print("originalPos2D: " + originalPos2D);

// Cette rotation est l'orientation auteur de la roue dans la Scene.
// `case0StopAngle` est appliquee par rapport a cette orientation.
const baseWheelRotation = wheelRotationTransform.getLocalRotation();
let spinAngle = 0;
let finalSpinBaseRotation = baseWheelRotation;
let isFinalSpinRunning = false;
let finalSpinInitialSlope = 1;
const DEG_TO_RAD = Math.PI / 180;

//________Caller________//
const WheelAnimEndCaller = script.subScene.CreateCaller("WheelAnimEndEvent");
//________Listener________//

const IntroTapListener = script.subScene.CreateListener("IntroTapEvent", IntroTapped);
const ExperienceStartListener = script.subScene.CreateListener("ExperienceStartEvent", ExperienceStarted);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {
  translateWheel.Reset();
  continuousSpin.Reset();
  finalSpinBaseRotation = baseWheelRotation;
  spinWheel.Reset();
  isFinalSpinRunning = false;
  // translateWheel.JumpTo(1);
}
//___________________________Functions__________________________//

function ExperienceStarted() {
  print("ExperienceStarted");
  translateWheel.GoTo(1);
  StartContinuousSpin();
}

function IntroTapped() {
  print("IntroTapped");
  if (!isFinalSpinRunning) {
    if (script.targetCase == 4) {
      SpinToCase(global.orderExperiences[global.currentExperienceIndex], script.fullTurns);
    } else {
      SpinToCase(script.targetCase, script.fullTurns);
    }
  }
}

function StartContinuousSpin() {
  isFinalSpinRunning = false;
  continuousSpin.duration = 360 / Math.max(1, script.continuousSpinSpeed);
  continuousSpin.Reset();
  // -1 est une repetition infinie pour le module Animation.
  continuousSpin.Start(-1);
}

function SpinToCase(caseIndex, turns) {
  const normalizedCase = ((Math.floor(caseIndex) % 4) + 4) % 4;
  const completeTurns = Math.max(0, Math.floor(turns));
  const direction = script.clockwise ? -1 : 1;
  const currentContinuousAngle = continuousSpin.GetRatio() * 360;
  const targetCaseAngle = script.case0StopAngle + normalizedCase * 90;
  const remainingAngle = (((targetCaseAngle - currentContinuousAngle) % 360) + 360) % 360;

  // Pause conserve l'angle affiché. La derniere rotation repart donc sans saut.
  finalSpinBaseRotation = wheelRotationTransform.getLocalRotation();
  continuousSpin.Pause();
  isFinalSpinRunning = true;

  // `fullTurns` ne s'applique qu'a cette derniere rotation, apres laquelle la
  // case voulue est alignee sur le repere configure avec `case0StopAngle`.
  spinAngle = direction * (completeTurns * 360 + remainingAngle);
  spinWheel.duration = Math.max(0.01, script.spinDuration);
  // La pente de l'easing correspond a la vitesse de la boucle : la transition
  // demarre donc a la meme vitesse avant de ralentir jusqu'a zero.
  const continuousSpeed = 360 / continuousSpin.duration;
  const requestedSlope = Math.abs(spinAngle) > 0 ? (continuousSpeed * spinWheel.duration) / Math.abs(spinAngle) : 0;
  // Au-dela de 3, une courbe cubique avec une vitesse finale nulle ne resterait
  // plus monotone. Avec au moins un tour final, la valeur reste normalement < 3.
  finalSpinInitialSlope = Math.min(3, requestedSlope);
  spinWheel.Reset();
  spinWheel.GoTo(1);
}

script.SpinToCase = SpinToCase;

//___________________________Animations_________________________//

const baseCenter = wheelParentTransform.anchors.getCenter();
const targetCenter = new vec2(baseCenter.x, baseCenter.y - script.offsetYWheel);

const translateWheel = new Animation(script.getSceneObject(), 1.6, (ratio) => {
  const currentCenter = vec2.lerp(baseCenter, targetCenter, 1 - ratio);
  wheelParentTransform.anchors.setCenter(currentCenter);
});

translateWheel.Easing = ElasticOut;

const continuousSpin = new Animation(
  script.getSceneObject(),
  2,
  (ratio) => {
    const direction = script.clockwise ? -1 : 1;
    const rotationOffset = quat.angleAxis(direction * ratio * 360 * DEG_TO_RAD, vec3.forward());
    wheelRotationTransform.setLocalRotation(rotationOffset.multiply(baseWheelRotation));
  },
  RepeatMode.Loop,
);

continuousSpin.Easing = Linear;

const spinWheel = new Animation(script.getSceneObject(), script.spinDuration, (ratio) => {
  const rotationOffset = quat.angleAxis(spinAngle * ratio * DEG_TO_RAD, vec3.forward());
  wheelRotationTransform.setLocalRotation(rotationOffset.multiply(finalSpinBaseRotation));
});

// Quintic Out : freinage tres prononce au debut, puis approche douce de l'arret.
spinWheel.Easing = function (ratio) {
  return 1 - Math.pow(1 - ratio, 5);
};

spinWheel.OnEnd = function (ratio) {
  if (ratio == 1) {
    print("SpinWheel ended");
    isFinalSpinRunning = false;
    translateWheel.GoTo(0);
    WheelAnimEndCaller.Call();
    print("currentExperienceIndex: " + global.currentExperienceIndex);

    if (script.targetCase == 4) {
      script.subScene.CallEnd(global.orderExperiences[global.currentExperienceIndex]);
    } else {
      script.subScene.CallEnd(script.targetCase);
    }
    global.currentExperienceIndex++;
  }
};
