//@input SceneObject parent
//@input Asset.Material[] outroMaterials
//@input float delayBeforeOutro = 1
//@input SceneObject restartButton

//@input float restartDelay = 0.7

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let outroButtonInteractionActive = false;
//________Caller________//
const RestartCaller = script.subScene.CreateCaller("RestartEvent");
//________Listener________//
const EndExperienceListener = script.subScene.CreateListener("EndExperienceEvent", OnEndExperience);
//________DelayEvent________//
const restartDelayEvent = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  script.subScene.CallEnd(null);
});

const FadeInOutroDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  animFadeOutro.GoTo(1);
  outroButtonInteractionActive = true;
});

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {
  animFadeOutro.Reset();
}
//___________________________Functions__________________________//

function OnEndExperience() {
  FadeInOutroDelay.event.reset(script.delayBeforeOutro);
}
//___________________________Buttons__________________________//
const restartButtonInteraction = script.restartButton.getComponent("Component.InteractionComponent");

restartButtonInteraction.onTouchStart.add(function () {
  if (!outroButtonInteractionActive) return;
  outroButtonInteractionActive = false;
  print("restart button tapped");
  animFadeOutro.GoTo(0);
  RestartCaller.Call();
  restartDelayEvent.event.reset(script.restartDelay);
});
//___________________________Animations_________________________//

const animFadeOutro = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.outroMaterials.forEach((material) => {
    material.mainPass.alphaRatio = ratio;
  });
});
