//@input SceneObject parent
//@input Asset.Material snowMaterial

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {
  animFadeSnow.GoTo(1);
}
function Update() {}
function Stop() {
  animFadeSnow.Reset();
}
//___________________________Functions__________________________//

//___________________________Animations_________________________//

const animFadeSnow = new Animation(script.getSceneObject(), 1.5, (ratio) => {
  script.snowMaterial.mainPass.alphaStart = ratio;
});
