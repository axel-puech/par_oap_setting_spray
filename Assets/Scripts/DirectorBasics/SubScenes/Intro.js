//@input SceneObject parent
//@input SceneObject tapScreen

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const introInteraction = script.tapScreen.getComponent("Component.InteractionComponent");

//________Caller________//
const IntroTapCaller = script.subScene.CreateCaller("IntroTapEvent");
const ExperienceStartCaller = script.subScene.CreateCaller("ExperienceStartEvent");
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//

// let tapEvent = script.subScene.CreateEvent("TapEvent", OnTap);
let hasTapped = false;

function Start() {
  print("in intro start");
}
function OnLateStart() {
  ExperienceStartCaller.Call();
  //script.subScene.CallEnd(null);
  hasTapped = false;
}

function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function OnTap() {
  if (!hasTapped) {
    hasTapped = true;
    IntroTapCaller.Call();
    // script.subScene.CallEnd(null);
  }
}

//___________________________Buttons__________________________//

introInteraction.onTouchStart.add(function () {
  if (!hasTapped) {
    hasTapped = true;
    IntroTapCaller.Call();
    // script.subScene.CallEnd(null);
  }
});

//___________________________Animations_________________________//
