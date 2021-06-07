﻿using UnityEngine;
using UnityEngine.VR.WSA.Input;
using UnityEngine.VR.WSA.WebCam;
using System.Linq;
using System.Collections.Generic;
using SharpConfig;
using System.Text;
using UnityEngine.Windows.Speech;
using System.Threading;
using System.IO;
using System;

public class FaceCaptureManager : MonoBehaviour
{
	KeywordRecognizer keywordRecognizer = null;
    Dictionary<string, System.Action> keywords = new Dictionary<string, System.Action>();

	public static FRGazeGestureManager Instance { get; private set; }

	GestureRecognizer recognizer;

	Resolution cameraResolution;

	PhotoCapture photoCaptureObject = null;

	Vector3 cameraPosition;
	Quaternion cameraRotation;
	
	public GameObject cursor;

	public GameObject textPrefab;
	public Vector3 textPlacement;
	public GameObject status;
	public GameObject framePrefab;
	public bool placeFramedPhotoInWorld;
	public GameObject framedPhotoPrefab;
	private GameObject newFramedPhoto;
	
	public bool tapToTakePicture = true;
	public float messageTimeOut = 3.0f;
	
	public string[] takePictureKeywords;
	
	
	string FaceAPIKey = "9a53eb01e52349b48aabb0f4774532e4";
	string EmotionAPIKey = "6c72ec57a32c460d9419f56eeca77368";
	string OpenFaceUrl = "http://ml.cer.auckland.ac.nz:8000";
	
	int capturedImageCount = 0;
	
	public AudioSource cameraClick;
	
	private bool waiting;
	
	public bool effectEnabled = false;
	public GameObject effects;
	
	public bool readyToTakePicture;
	
	// Use this for initialization
	void Awake()
	{
		Instance = this;
		recognizer = new GestureRecognizer();
		
		if (tapToTakePicture){
			// Set up a GestureRecognizer to detect Select gestures.
			
			recognizer.TappedEvent += (source, tapCount, ray) =>
			{
				var headPosition = Camera.main.transform.position;
				var gazeDirection = Camera.main.transform.forward;
			
				RaycastHit hitInfo;
				if (Physics.Raycast(headPosition, gazeDirection, out hitInfo,
					30.0f, SpatialMapping.PhysicsRaycastMask))
				{
					TakeFaceRecognitionPicture();
						/*
						status.GetComponent<TextMesh>().text = "taking photo...";
						status.SetActive(true);
						PhotoCapture.CreateAsync(false, OnPhotoCaptureCreated);
						PlayCameraClickSound();
						//this.BroadcastMessage("DoTakePicture");
						*/
						
				}
			
				/*
				Debug.Log("tap");
				status.GetComponent<TextMesh>().text = "taking photo...";
				status.SetActive(true);
				PhotoCapture.CreateAsync(false, OnPhotoCaptureCreated);
				PlayCameraClickSound();
				//this.BroadcastMessage("DoTakePicture");
				*/
			};

			
		}
		
		recognizer.StartCapturingGestures();

		//PhotoCapture.CreateAsync(false, OnPhotoCaptureCreated);

		// Setup face caotyre api
		if (File.Exists("config.cfg"))
		{
			var cfg = Configuration.LoadFromFile("config.cfg");
			var apiSettings = cfg["API"];
			FaceAPIKey = apiSettings["FaceAPIKey"].StringValue;
			EmotionAPIKey = apiSettings["EmotionAPIKey"].StringValue;
			OpenFaceUrl = apiSettings["OpenFaceUrl"].StringValue;
			Debug.Log("loaded settings from config.cfg");
		}
		
		status.SetActive(false);

	}
	
	// Initialize keywords
	void Start()
    {
		effects.SetActive(effectEnabled);
		
        keywords.Add("Reset world", () =>
        {
            // Call the OnReset method on every descendant object.
            this.BroadcastMessage("OnReset");
        });

		foreach(string kw in takePictureKeywords){
			Debug.Log("Adding Take Picture KEYWORD - " + kw);
			keywords.Add(kw, () =>
			{
				TakeFaceRecognitionPicture();
				   //this.BroadcastMessage("DoTakePicture");    
				/*
				status.GetComponent<TextMesh>().text = "taking photo...";
				status.SetActive(true);
				PhotoCapture.CreateAsync(false, OnPhotoCaptureCreated);
				PlayCameraClickSound();
				*/
			});
		}
		
		keywords.Add("Effects On", () =>
        {
			effects.SetActive(true);
		});
		
		keywords.Add("Effects Off", () =>
        {
			effects.SetActive(false);
		});
		
        // Tell the KeywordRecognizer about our keywords.
        keywordRecognizer = new KeywordRecognizer(keywords.Keys.ToArray());

        // Register a callback for the KeywordRecognizer and start recognizing!
        keywordRecognizer.OnPhraseRecognized += KeywordRecognizer_OnPhraseRecognized;
        keywordRecognizer.Start();
    }
	
	public void TakeFaceRecognitionPicture()
	{
		if (!readyToTakePicture){
			// Message user that they can't take a picture 
			status.GetComponent<TextMesh>().text = "subject not in range";
			return;
		}
		
		status.GetComponent<TextMesh>().text = "taking photo...";
		status.SetActive(true);
		PhotoCapture.CreateAsync(false, OnPhotoCaptureCreated);
		PlayCameraClickSound();
		//this.BroadcastMessage("DoTakePicture");

	}
		
	void OnPhotoCaptureCreated(PhotoCapture captureObject)
	{
		photoCaptureObject = captureObject;

		cameraResolution = PhotoCapture.SupportedResolutions.OrderByDescending((res) => res.width * res.height).First();

		CameraParameters c = new CameraParameters();
		c.hologramOpacity = 0.0f;
		c.cameraResolutionWidth = cameraResolution.width;
		c.cameraResolutionHeight = cameraResolution.height;
		c.pixelFormat = CapturePixelFormat.PNG;
		c.frameRate = 30.0f;

		captureObject.StartPhotoModeAsync(c, OnPhotoModeStarted);
		//captureObject.StartPhotoModeAsync(c);
	}

	private void OnPhotoModeStarted(PhotoCapture.PhotoCaptureResult result)
	{
		if (result.success)
		{
			Debug.Log("Camera ready");
			photoCaptureObject.TakePhotoAsync(OnCapturedPhotoToMemory);
		}
		else
		{
			Debug.LogError("Unable to start photo mode!");
		}
	}

	IEnumerator<object> PostToFaceAPI(byte[] imageData, Matrix4x4 cameraToWorldMatrix, Matrix4x4 pixelToCameraMatrix) {

		var url = "https://api.projectoxford.ai/face/v1.0/detect?returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses";
		var headers = new Dictionary<string, string>() {
			{ "Ocp-Apim-Subscription-Key", FaceAPIKey },
			{ "Content-Type", "application/octet-stream" }
		};

		WWW www = new WWW(url, imageData, headers);
		yield return www;
		string responseString = www.text;
		
		JSONObject j = new JSONObject(responseString);
		Debug.Log(j);
		var existing = GameObject.FindGameObjectsWithTag("faceText");

		foreach (var go in existing ) {
			Destroy(go);
		}

		existing = GameObject.FindGameObjectsWithTag("faceBounds");

		foreach (var go in existing)
		{
			Destroy(go);
		}

		if (j.list.Count == 0)
		{
			status.GetComponent<TextMesh>().text = "no faces found";
			cursor.SendMessage("StartMessageTimeout", SendMessageOptions.DontRequireReceiver);
			yield break;
		}
		else
		{
			status.SetActive(false);
		}

		string detailText = "";
		var faceRectangles = "";
		Dictionary<string, TextMesh> textmeshes = new Dictionary<string, TextMesh>();
		Dictionary<string, WWW> recognitionJobs = new Dictionary<string, WWW>();
		string photoFilepath = "";
		foreach (var result in j.list) {
			GameObject txtObject = (GameObject)Instantiate(textPrefab);
			TextMesh txtMesh = txtObject.GetComponent<TextMesh>();
			var a = result.GetField("faceAttributes");
			var f = a.GetField("facialHair");
			var p = result.GetField("faceRectangle");
			float top = -(p.GetField("top").f / cameraResolution.height -.5f);
			float left = p.GetField("left").f / cameraResolution.width - .5f;
			float width = p.GetField("width").f / cameraResolution.width;
			float height = p.GetField("height").f / cameraResolution.height;

			string id = string.Format("{0},{1},{2},{3}", p.GetField("left"), p.GetField("top"), p.GetField("width"), p.GetField("height"));
			textmeshes[id] = txtMesh;

			try
			{
				capturedImageCount++;
				var source = new Texture2D(0, 0);
				source.LoadImage(imageData);
				var dest = new Texture2D((int)p["width"].i, (int)p["height"].i);
				dest.SetPixels(source.GetPixels((int)p["left"].i, cameraResolution.height - (int)p["top"].i - (int)p["height"].i, (int)p["width"].i, (int)p["height"].i));
				byte[] justThisFace = dest.EncodeToPNG();
				
				string filename = string.Format(@"CapturedImageCropped{0}.png", capturedImageCount);
				//string filepath = Path.Combine(Application.persistentDataPath, "cropped.png");	
				string filepath = Path.Combine(Application.persistentDataPath, filename);	
				File.WriteAllBytes(filepath, justThisFace);
				photoFilepath = filepath;
				Debug.Log("saved " + filepath);
				recognitionJobs[id] = new WWW(OpenFaceUrl, justThisFace);
				Debug.Log(recognitionJobs.Count + " recog jobs running");
			} catch (Exception e) {
				Debug.LogError(e);
			}

			if (faceRectangles == "") {
				faceRectangles = id;
			} else {
				faceRectangles += ";" + id;
			}

			if (placeFramedPhotoInWorld){
				// Place a framed photo in the space
				
				GameObject fpp = (GameObject)Instantiate(framedPhotoPrefab);
				fpp.transform.position = cameraToWorldMatrix.MultiplyPoint3x4(pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(left + width / 2, top, 0)));
				fpp.transform.rotation = cameraRotation;
				fpp.BroadcastMessage("LoadFileTextureToMaterial", photoFilepath, SendMessageOptions.DontRequireReceiver);
				//Vector3 scale = pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(width, height, 0));
				//scale.z = .1f;
				//fpp.transform.localScale = scale;
				newFramedPhoto = fpp;
			} else {
				// Create bounding box for face
				GameObject faceBounds = (GameObject)Instantiate(framePrefab);
				faceBounds.transform.position = cameraToWorldMatrix.MultiplyPoint3x4(pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(left + width / 2, top, 0)));
				faceBounds.transform.rotation = cameraRotation;
				Vector3 scale = pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(width, height, 0));
				scale.z = .1f;
				faceBounds.transform.localScale = scale;
				faceBounds.tag = "faceBounds";
				
	
			}
			
			// Create a text object for face details
			Vector3 origin = cameraToWorldMatrix.MultiplyPoint3x4(pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(left + width + .1f, top, 0)));
			//Vector3 origin = cameraToWorldMatrix.MultiplyPoint3x4(pixelToCameraMatrix.MultiplyPoint3x4(new Vector3(textPlacement.x, textPlacement.y, 0)));
			txtObject.transform.position = origin;
			txtObject.transform.rotation = cameraRotation;
			txtObject.tag = "faceText";
			if (j.list.Count > 1) {
				txtObject.transform.localScale /= 2;
			}

			txtMesh.text = string.Format("Gender: {0}\nAge: {1}\nMoustache: {2}\nBeard: {3}\nSideburns: {4}\nGlasses: {5}\nSmile: {6}", a.GetField("gender").str, a.GetField("age"), f.GetField("moustache"), f.GetField("beard"), f.GetField("sideburns"), a.GetField("glasses").str, a.GetField("smile"));
			detailText = string.Format("Gender: {0}\nAge: {1}\nMoustache: {2}\nBeard: {3}\nSideburns: {4}\nGlasses: {5}\nSmile: {6}", a.GetField("gender").str, a.GetField("age"), f.GetField("moustache"), f.GetField("beard"), f.GetField("sideburns"), a.GetField("glasses").str, a.GetField("smile"));
		
			if (newFramedPhoto){
				Debug.Log("[Photo Details] : " + detailText);
				newFramedPhoto.SendMessage("SetTextPrefabText", detailText, SendMessageOptions.DontRequireReceiver);
			}
		
		}

		// Emotion API

		url = "https://api.projectoxford.ai/emotion/v1.0/recognize?faceRectangles=" + faceRectangles;

		headers["Ocp-Apim-Subscription-Key"] = EmotionAPIKey;

		www = new WWW(url, imageData, headers);
		yield return www;
		responseString = www.text;

		j = new JSONObject(responseString);
		Debug.Log(j);
		existing = GameObject.FindGameObjectsWithTag("emoteText");

		/*
		foreach (var go in existing)
		{
			Destroy(go);
		}
		*/
		foreach (var result in j.list) {
			var p = result.GetField("faceRectangle");
			string id = string.Format("{0},{1},{2},{3}", p.GetField("left"), p.GetField("top"), p.GetField("width"), p.GetField("height"));
			var txtMesh = textmeshes[id];
			var obj = result.GetField("scores");
			string highestEmote = "Unknown";
			float highestC = 0;
			for (int i = 0; i < obj.list.Count; i++)
			{
				string key = obj.keys[i];
				float c = obj.list[i].f;
				if (c > highestC) {
					highestEmote = key;
					highestC = c;
				}
			}
			txtMesh.text += "\nEmotion: " + highestEmote;
			detailText += "\nEmotion: " + highestEmote;
			
			if (newFramedPhoto){
				Debug.Log("[Photo Details] : " + detailText);
				newFramedPhoto.SendMessage("SetTextPrefabText", detailText, SendMessageOptions.DontRequireReceiver);
			}
		}

		// OpenFace API

		foreach (var kv in recognitionJobs) {
			var id = kv.Key;
			www = kv.Value;
			yield return www;
			responseString = www.text;
			j = new JSONObject(responseString);
			Debug.Log(j);
			var txtMesh = textmeshes[id];
			var d = j["data"];
			var recogString = string.Format("\nRecognition confidence: {0}\nUPI: {1}\nName: {2}", j["confidence"], j["uid"].str, d["fullName"].str);
			if (d["positions"].Count > 0) {
				var p = d["positions"][0];
				recogString += string.Format("\nPosition: {0}\nDepartment: {1}\nReports to: {2}", p["position"].str, p["department"]["name"].str, p["reportsTo"]["name"].str);
			}
			txtMesh.text += recogString;
			detailText += recogString;
			
			if (newFramedPhoto){
				Debug.Log("[Photo Details] : " + detailText);
				newFramedPhoto.SendMessage("SetTextPrefabText", detailText, SendMessageOptions.DontRequireReceiver);
			}
		}
		
		
	}

	void OnCapturedPhotoToMemory(PhotoCapture.PhotoCaptureResult result, PhotoCaptureFrame photoCaptureFrame)
	{
		if (result.success)
		{
			Debug.Log("photo captured");
			List<byte> imageBufferList = new List<byte>();
			// Copy the raw IMFMediaBuffer data into our empty byte list.
			photoCaptureFrame.CopyRawImageDataIntoBuffer(imageBufferList);

			var cameraToWorldMatrix = new Matrix4x4();
			photoCaptureFrame.TryGetCameraToWorldMatrix(out cameraToWorldMatrix);
			
			cameraPosition = cameraToWorldMatrix.MultiplyPoint3x4(new Vector3(0,0,-1));
			cameraRotation = Quaternion.LookRotation(-cameraToWorldMatrix.GetColumn(2), cameraToWorldMatrix.GetColumn(1));

			Matrix4x4 projectionMatrix;
			photoCaptureFrame.TryGetProjectionMatrix(Camera.main.nearClipPlane, Camera.main.farClipPlane, out projectionMatrix);
			Matrix4x4 pixelToCameraMatrix = projectionMatrix.inverse;

			status.GetComponent<TextMesh>().text = "photo captured, processing...";
			//status.transform.position = cameraPosition;
			//status.transform.rotation = cameraRotation;

			StartCoroutine(PostToFaceAPI(imageBufferList.ToArray(), cameraToWorldMatrix, pixelToCameraMatrix));
		}
		photoCaptureObject.StopPhotoModeAsync(OnStoppedPhotoMode);
	}

	void OnStoppedPhotoMode(PhotoCapture.PhotoCaptureResult result)
	{
		photoCaptureObject.Dispose();
		photoCaptureObject = null;
	}

	private void KeywordRecognizer_OnPhraseRecognized(PhraseRecognizedEventArgs args)
    {
        System.Action keywordAction;
        if (keywords.TryGetValue(args.text, out keywordAction))
        {
            keywordAction.Invoke();
			Debug.Log("[!] KEYWORD RECOGNIZED : " + args.text);
        }
    }
	
	public void PlayCameraClickSound()
	{
		Debug.Log("*********** CLICK ************");
		if (cameraClick){
			cameraClick.Play();
		}
		
	}
	
	
}