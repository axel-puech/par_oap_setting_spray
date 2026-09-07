//@input SceneObject parent
//@input string[] experiences {"label":"4 expériences"}
//@input Asset.Material hintIntroMat
//@input Asset.Material hintExperienceMat
//@input Asset.Material tapToSprayMat

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

global.orderExperiences = [];
//________Caller________//
//________Listener________//
const IntroTapListener = script.subScene.CreateListener("IntroTapEvent", IntroTapped);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  var experiencesMelangees = script.experiences.slice();

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
}
//___________________________Functions__________________________//

function IntroTapped() {
  fadeHintIntro.GoTo(0);
  fadeHintExperience.GoTo(1);
}

//___________________________Animations_________________________//

const fadeHintIntro = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.hintIntroMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});

const fadeHintExperience = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.hintExperienceMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
  script.tapToSprayMat.mainPass.baseColor = new vec4(1, 1, 1, ratio);
});
