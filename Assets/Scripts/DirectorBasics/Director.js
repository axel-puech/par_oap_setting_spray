//@input SceneObject subSceneParent
//@input bool useFrontBack = true;

var director = null;

script.createEvent("OnStartEvent").bind(OnStart);

function OnStart() {
  director = new global.Director(script, script.subSceneParent, script.useFrontBack, OnSceneEnded);
}

//global.touchSystem.touchBlocking = true
function OnSceneEnded(sceneName, params) {
  print("OnSceneEnded: " + sceneName + " with params: " + params);

  switch (sceneName) {
    case "Intro":
      switch (params) {
        case 0:
          print("Going to Snowy");
          director.GoToScene("Experience_Snowy", false, false);
          break;
        case 1:
          print("Going to Windy");
          director.GoToScene("Experience_Windy", false, false);
          break;
        case 2:
          print("Going to Foggy");
          director.GoToScene("Experience_Foggy", false, false);
          break;
        case 3:
          print("Going to Rainy");
          director.GoToScene("Experience_Rainy", false, false);
          break;
      }
      break;

    case "Experience_Snowy":
    case "Experience_Windy":
    case "Experience_Foggy":
    case "Experience_Rainy":
      print("Going to Intro");
      director.GoToScene("Intro", false, false);
      break;
  }
}
