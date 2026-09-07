//@input SceneObject parent

//@input SceneObject wheelParent
//@input float offsetYWheel
//@input SceneObject wheelRotation

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const wheelParentTransform = script.wheelParent.getComponent("Component.ScreenTransform");
const originalPos2D = wheelParentTransform.anchors.getCenter();
print("originalPos2D: " + originalPos2D);

//________Caller________//
//________Listener________//

const IntroTapListener = script.subScene.CreateListener("IntroTapEvent", IntroTapped);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {
  translateWheel.GoTo(1);
}
function Update() {}
function Stop() {
  translateWheel.Reset();
  // translateWheel.JumpTo(1);
}
//___________________________Functions__________________________//

function IntroTapped() {
  print("IntroTapped");
  translateWheel.GoTo(0);
}

//___________________________Animations_________________________//

const baseCenter = wheelParentTransform.anchors.getCenter();
const targetCenter = new vec2(baseCenter.x, baseCenter.y - script.offsetYWheel);

const translateWheel = new Animation(script.getSceneObject(), 1.6, (ratio) => {
  const currentCenter = vec2.lerp(baseCenter, targetCenter, 1 - ratio);
  wheelParentTransform.anchors.setCenter(currentCenter);
});

translateWheel.Easing = ElasticOut;
