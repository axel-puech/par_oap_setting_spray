//@input SceneObject parent
//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
const IntroTapCaller = script.subScene.CreateCaller("IntroTapEvent");
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//

let tapEvent = script.subScene.CreateEvent("TapEvent", OnTap);
let hasTapped = false;

function Start() {
  print("in intro start");
}
function OnLateStart() {
  //script.subScene.CallEnd(null);
}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function OnTap() {
  if (!hasTapped) {
    print("tapped");
    hasTapped = true;
    IntroTapCaller.Call();
    script.subScene.CallEnd(null);
  }
}

//___________________________Animations_________________________//
