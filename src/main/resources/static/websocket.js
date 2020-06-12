
var username,websocket,id;


$("document").ready(()=> {
  $("#page-content").hide();
  $("#getInModal").modal({
    backdrop: false
  });
});

$("#getInForm").on("submit",async (e)=> {
  e.preventDefault();

    username = $("#inputUsername").val();
    console.log(`Loged in as ${username}`);

    websocket = new WebSocket("wss://socket-group-chat-app.herokuapp.com/websocket");
    console.log(websocket);


    websocket.onopen = ()=>{
      websocket.send(JSON.stringify({
        user: username,
        action: "joined"
      }));
    }

    websocket.onmessage = (event) => {
      try {
        let data = JSON.parse(event.data);
        switch (data.action) {
          case "message":
            handleMessage(data);
            break;
          case "joined":
            showJoinedUser(data);
            break;
          case "left":
            showLeftedUser(data);
            break;
          case "connection":
            id = data.id;
            console.log(id);
            break;
          default:
            console.log(data);
            break;
        }
      }catch (err) {
        console.log(err);
        //handleVideoBlob(event.data);
      }
    }

    websocket.onclose = (ev)=> {
      console.log(ev.reason+'connection closed');
    }

    $("#getInModal").modal("toggle");
    $("#page-content").show();
});

function showJoinedUser(data)
{
  $("<div/>",{
    class: "alert alert-success text-center",
  }).text(`${data.user} joined the group`)
  .appendTo("#chatBody");

  //add user in grouplist
    $("<a/>",{
        class: "list-group-item list-group-item-action",
        href: "#"
    }).text(data.user).appendTo("#groupMembers")
}

function showLeftedUser(data) {
  $("<div/>",{
    class: "alert alert-danger text-center",
  }).text(`${data.user} left the group `)
      .appendTo("#chatBody");
}

function handleMessage(jsonData) {
  if (jsonData.type==="text/plain") {
    addTextMessage(jsonData);
  } else if (jsonData.type==="image"){
    addImageMessage(jsonData);
  }else if (jsonData.type==="video"){
    addVideoMessage(jsonData);
  } else if (jsonData.type==="text/link"){
    addLinkMessage(jsonData)
  }
}

function addTextMessage(jsonObject) {
  let sent = (jsonObject.id === this.id);
  if(sent)
  {
    $("<div/>",{
      class: 'msg-div sent'
    }).append($("<div/>",{
      class: 'message-text bg-primary text-light'
    }).text(jsonObject.content)
    ).appendTo("#chatBody");
  } else {
    let metadata = $("<div/>").append($("<small>").text(jsonObject.user+"\t"),$("<small>").text(jsonObject.time));
    $("<div/>",{
      class: 'msg-div receive'
    }).append(metadata, $("<div/>",{
      class: 'message-text bg-light'
    }).text(jsonObject.content)).appendTo("#chatBody");
  }
}


function addImageMessage(jsonObject) {
  let sent = jsonObject["id"].toString()===this.id;
  if (sent)
  {
    $("<div>",{
      class: "msg-div sent"
    }).append($("<img/>",{
      class: "img-fluid img-thumbnail",
      src: jsonObject.content.toString()
    })).appendTo("#chatBody");
  }
  else {
    let metadata = $("<div/>").append($("<small>").text(jsonObject.user+"\t"),$("<small>").text(jsonObject.time));
    $("<div>",{
      class: "msg-div receive"
    }).append(metadata,$("<img>",{
      class: "img-fluid img-thumbnail",
      src: jsonObject.content.toString()
    })).appendTo("#chatBody");
  }
}


function addVideoMessage(jsonObject) {
  let sent = jsonObject["id"].toString()===this.id;
  if (sent)
  {
    $("<div>",{
      class: "msg-div sent"
    }).append($("<video>",{
      height: "100%",
      width: "100%",
      controls: true,
      srcObject: jsonObject.content.toString()
    })).appendTo("#chatBody");
  }
  else {
    let metadata = $("<div/>").append($("<small>").text(jsonObject.user+"\t"),$("<small>").text(jsonObject.time));
    $("<div>",{
      class: "msg-div receive"
    }).append(metadata,$("<video>",{
      height: "100%",
      width: "100%",
      controls: true
    }).append("<source>",{
      src:jsonObject.content.toString(),
      type:jsonObject.type
    })).appendTo("#chatBody");
  }
}

function addLinkMessage(jsonObject) {
  let sent = (jsonObject.id === this.id);
  let platform = jsonObject.platform;
  if (platform==="youtube"||platform==="facebook"){
    if(sent)
    {
      $("<div/>",{
        class: 'msg-div sent'
      }).append($("<div/>",{
            class: 'embed-responsive embed-responsive-16by9'
          }).append("<iframe>",{
            src: jsonObject.content.toString(),
            class: "embed-responsive-item"
          })
      ).appendTo("#chatBody");
    } else {
      let metadata = $("<div/>").append($("<small>").text(jsonObject.user+"\t"),$("<small>").text(jsonObject.time));
      $("<div/>",{
        class: 'msg-div receive'
      }).append(metadata, $("<div/>",{
            class: 'embed-responsive embed-responsive-16by9'
          }).append("<iframe>",{
            src: jsonObject.content,
            class: "embed-responsive-item"
          })
      ).appendTo("#chatBody");
    }
  }
  else if(platform==="others"){
    if(sent)
    {
      $("<div/>",{
        class: 'msg-div sent'
      }).append($("<a/>",{
            class: 'message-text bg-primary text-light',
            href: jsonObject.content.toString(),
            target: "_blank"
          }).text(jsonObject.content)
      ).appendTo("#chatBody");
    } else {
      let metadata = $("<div/>").append($("<small>").text(jsonObject.user+"\t"),$("<small>").text(jsonObject.time));
      $("<div/>",{
        class: 'msg-div receive'
      }).append(metadata, $("<a/>",{
        class: 'message-text bg-light',
        href: jsonObject.content.toString(),
        target: "_blank"
      }).text(jsonObject.content)).appendTo("#chatBody");
    }
  }
}
