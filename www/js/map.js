/* ----------------------------------------------------------------------------- start : map_page ----------------------------------------------------------------------------- */
$(".menu_map_page").on("click", function () {
  loading.show();
  var status = navigator.onLine;
  if (status) {
    if (CurrentPosUrgentNoti) {
      changePage("map_page", function () {
        initialMapPageFunc();
        setTimeout(function () {
          loading.hide();
        }, 500);
      });
    } else {
      loading.hide();
      let chkPos = confirm("กรุณาอุนญาติตำแหน่ง");
      if (chkPos) {
        document.addEventListener("deviceready", onDeviceMapPageReady, false);
      } else {
      }
    }
  } else {
    alert("กรุณาเชื่อมต่ออินเตอร์เน็ต");
    loading.hide();
  }
});
function onDeviceMapPageReady() {
  navigator.geolocation.getCurrentPosition(onSuccessMapPage, onErrorMapPage, {
    enableHighAccuracy: true,
  });
}
function onSuccessMapPage(pos) {
  CurrentPosUrgentNoti = pos;
  changePage("map_page", function () {
    initialMapPageFunc();
    setTimeout(function () {
      loading.hide();
    }, 500);
  });
}
function onErrorMapPage(error) {
  alert("ไม่สามารถเข้าถึงตำแหน่งได้");
}
let typeDataMap = "";
let gisProvinces = "";
let ListElderMap = [];
let TempElderMap;
let ListOfficeMap = [];
let TempOfficeMap;
let ListShphMap = [];
let TempShphMap;
var InforObj = [];
let MapPagemarkerOriginal;
let MapPageinfowindowOriginal;
let MapPagemarkerDestination;
let MapPageinfowindowDestination;
let MapPagedirectionsService;
let MapPagedirectionsRenderer;
let markers = [];
let PosCurrent;
function initialMapPageFunc() {
  queryGetIdProvinceByVhv(function (res) {
    if (res.length > 0) {
      $.each(res, function (key, value) {
        if (key == 0) {
          gisProvinces = value.GIS_PROVINCE;
        } else {
          gisProvinces += "," + value.GIS_PROVINCE;
        }
      });
    }
  });
  let PosLocal = true;
  if (PosLocal) {
    PosCurrent = {
      lat: 16.442611448372272,
      long: 102.82001846528836,
    };
  } else {
    PosCurrent = {
      lat: CurrentPosUrgentNoti.coords.latitude,
      long: CurrentPosUrgentNoti.coords.longitude,
    };
  }

  initialelderFunc();
}
function initialelderFunc() {
  typeDataMap = "elder";
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  $("#map_page .content .filterPosition #filterShow").show();
  $("#map_page .content .filterPosition #filterHide").hide();
  $("#map_page .content .selecePosition").show();
  $("#map_page .content #elderContentFixed").hide();
  $("#map_page .footer").show();
  $("#map_page .content").css("bottom", "70px");
  $(
    "#map_page .content .filterPosition #filterShow #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .filterPosition #filterHide #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button"
  ).removeClass("active");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button#elder"
  ).addClass("active");
  queryALL("VHV_TR_ELDER", function (res) {
    ListElderMap = res;
    $.each(ListElderMap, function (index, row) {
      if (row.ELDER_LAT != "null" && row.ELDER_LONG != "null") {
        row.DISTANCE = getDistanceFromLatLonInKm(
          PosCurrent.lat,
          PosCurrent.long,
          row.ELDER_LAT,
          row.ELDER_LONG
        ).toFixed(1);
      } else {
        row.DISTANCE = "N/A";
      }
      row.CURRENT_LAT = PosCurrent.lat;
      row.CURRENT_LONG = PosCurrent.long;
    });
    MarkerMap(ListElderMap);
  });
}

function MarkerMap(arr) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(PosCurrent.lat, PosCurrent.long), //new google.maps.LatLng(15.816036, 103.267594),
    zoom: 16,
    disableDefaultUI: true,
    mapTypeControl: false,
  });
  MapPagedirectionsService = new google.maps.DirectionsService();
  MapPagedirectionsRenderer = new google.maps.DirectionsRenderer();
  let pin_marker = "";
  if (
    $(
      "#map_page .content .selecePosition .card-body .btn_select_group button#elder"
    ).hasClass("active")
  ) {
    pin_marker = "img/pin_marker.png";
  }
  if (
    $(
      "#map_page .content .selecePosition .card-body .btn_select_group button#office"
    ).hasClass("active")
  ) {
    pin_marker = "img/pin_marker_yellor.png";
  }
  if (
    $(
      "#map_page .content .selecePosition .card-body .btn_select_group button#shph"
    ).hasClass("active")
  ) {
    pin_marker = "img/pin_marker_blue.png";
  }
  markers = [];
  // Create markers.
  if (typeDataMap == "elder") {
    for (let i = 0; i < arr.length; i++) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          arr[i]["ELDER_LAT"],
          arr[i]["ELDER_LONG"]
        ),
        icon: pin_marker,
        map: map,
        id: arr[i]["ID"],
      });
      marker.addListener("click", function () {
        closeOtherInfo();
        infowindowDestination = new google.maps.InfoWindow();
        var contentString =
          '<div id="bodyMapPagemarkerContent"><p>' +
          arr[i]["ELDER_NAME"] +
          "</p>" +
          "</div>";
        infowindowDestination.setContent(contentString);
        infowindowDestination.open(map, marker);
        InforObj[0] = infowindowDestination;
        routeMap(arr[i]["ID"]);
      });
      markers.push(marker);
    }
  } else if (typeDataMap == "office") {
    for (let i = 0; i < arr.length; i++) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          arr[i]["OFFICE_LAT"],
          arr[i]["OFFICE_LONG"]
        ),
        icon: pin_marker,
        map: map,
        id: arr[i]["ID"],
      });
      marker.addListener("click", function () {
        closeOtherInfo();
        infowindowDestination = new google.maps.InfoWindow();
        var contentString =
          '<div id="bodyMapPagemarkerContentOffice"><p>' +
          arr[i]["OFFICE_NAME"] +
          "</p>" +
          "</div>";
        infowindowDestination.setContent(contentString);
        infowindowDestination.open(map, marker);
        InforObj[0] = infowindowDestination;
        routeMap(arr[i]["ID"]);
      });
      markers.push(marker);
    }
  } else if (typeDataMap == "shph") {
    for (let i = 0; i < arr.length; i++) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          arr[i]["SHPH_LAT"],
          arr[i]["SHPH_LONG"]
        ),
        icon: pin_marker,
        map: map,
        id: arr[i]["ID"],
      });
      marker.addListener("click", function () {
        closeOtherInfo();
        infowindowDestination = new google.maps.InfoWindow();
        var contentString =
          '<div id="bodyMapPagemarkerContentShph" ><p>' +
          arr[i]["SHPH_NAME"] +
          "</p>" +
          "</div>";
        infowindowDestination.setContent(contentString);
        infowindowDestination.open(map, marker);
        InforObj[0] = infowindowDestination;
        routeMap(arr[i]["ID"]);
      });
      markers.push(marker);
    }
  }
}
function closeOtherInfo() {
  if (InforObj.length > 0) {
    /* detach the info-window from the marker ... undocumented in the API docs */
    InforObj[0].set("marker", null);
    /* and close it */
    InforObj[0].close();
    /* blank the array */
    InforObj.length = 0;
  }
}
function routeMap(ID) {
  if (typeDataMap == "elder") {
    TempElderMap = ListElderMap.filter((x) => x.ID == ID)[0];
    let distanceelderText = "ไม่พบพิกัด";
    if (TempElderMap.DISTANCE != "N/A") {
      distanceelderText = "ห่างจากคุณ " + TempElderMap.DISTANCE + " km.";
    }
    $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
      "src",
      TempElderMap["ELDER_AVATAR"]
    );
    $("#map_page .content .elder_content_fixed .card-body-content .name").text(
      TempElderMap["ELDER_NAME"]
    );
    $("#map_page .content .elder_content_fixed .card-body-content h5")
      .eq(1)
      .text(distanceelderText);
    $(
      "#map_page .content .filterPosition #filterShow #destination_position p"
    ).text(TempElderMap["ELDER_NAME"]);
    $(
      "#map_page .content .filterPosition #filterHide #destination_position p"
    ).text(TempElderMap["ELDER_NAME"]);
    toggleFilter();
    $("#map_page .content .selecePosition").hide();
    $("#map_page .content #elderContentFixed").show();
    $("#map_page .footer").hide();
    $("#map_page .content").css("bottom", "0px");
    MarkerDirectionsMap(
      new google.maps.LatLng(
        TempElderMap["CURRENT_LAT"],
        TempElderMap["CURRENT_LONG"]
      ),
      new google.maps.LatLng(
        TempElderMap["ELDER_LAT"],
        TempElderMap["ELDER_LONG"]
      ),
      TempElderMap["ID"],
      TempElderMap["ELDER_NAME"]
    );
  } else if (typeDataMap == "office") {
    TempOfficeMap = ListOfficeMap.filter((x) => x.ID == ID)[0];
    let distanceofficeText = "ไม่พบพิกัด";
    if (TempOfficeMap.DISTANCE != "N/A") {
      distanceofficeText = "ห่างจากคุณ " + TempOfficeMap.DISTANCE + " km.";
    }
    $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
      "src",
      "img/home_icon.png"
    );
    $("#map_page .content .elder_content_fixed .card-body-content .name").text(
      TempOfficeMap["OFFICE_NAME"]
    );
    $("#map_page .content .elder_content_fixed .card-body-content h5")
      .eq(1)
      .text(distanceofficeText);
    $(
      "#map_page .content .filterPosition #filterShow #destination_position p"
    ).text(TempOfficeMap["OFFICE_NAME"]);
    $(
      "#map_page .content .filterPosition #filterHide #destination_position p"
    ).text(TempOfficeMap["OFFICE_NAME"]);
    toggleFilter();
    $("#map_page .content .selecePosition").hide();
    $("#map_page .content #elderContentFixed").show();
    $("#map_page .footer").hide();
    $("#map_page .content").css("bottom", "0px");
    MarkerDirectionsMap(
      new google.maps.LatLng(
        TempOfficeMap["CURRENT_LAT"],
        TempOfficeMap["CURRENT_LONG"]
      ),
      new google.maps.LatLng(
        TempOfficeMap["OFFICE_LAT"],
        TempOfficeMap["OFFICE_LONG"]
      ),
      TempOfficeMap["ID"],
      TempOfficeMap["OFFICE_NAME"]
    );
  } else if (typeDataMap == "shph") {
    TempShphMap = ListShphMap.filter((x) => x.ID == ID)[0];
    let distanceshphText = "ไม่พบพิกัด";
    if (TempShphMap.DISTANCE != "N/A") {
      distanceshphText = "ห่างจากคุณ " + TempShphMap.DISTANCE + " km.";
    }
    $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
      "src",
      "img/home_icon.png"
    );
    $("#map_page .content .elder_content_fixed .card-body-content .name").text(
      TempShphMap["SHPH_NAME"]
    );
    $("#map_page .content .elder_content_fixed .card-body-content h5")
      .eq(1)
      .text(distanceshphText);
    $(
      "#map_page .content .filterPosition #filterShow #destination_position p"
    ).text(TempShphMap["SHPH_NAME"]);
    $(
      "#map_page .content .filterPosition #filterHide #destination_position p"
    ).text(TempShphMap["SHPH_NAME"]);
    toggleFilter();
    $("#map_page .content .selecePosition").hide();
    $("#map_page .content #elderContentFixed").show();
    $("#map_page .footer").hide();
    $("#map_page .content").css("bottom", "0px");
    MarkerDirectionsMap(
      new google.maps.LatLng(
        TempShphMap["CURRENT_LAT"],
        TempShphMap["CURRENT_LONG"]
      ),
      new google.maps.LatLng(TempShphMap["SHPH_LAT"], TempShphMap["SHPH_LONG"]),
      TempShphMap["ID"],
      TempShphMap["SHPH_NAME"]
    );
  }
}
// ปิด filter
$("#map_page .content .filterPosition #filterBar").on("click", function () {
  toggleFilter();
});
function toggleFilter() {
  if ($("#map_page .content .filterPosition #filterShow").is(":visible")) {
    $("#map_page .content .filterPosition #filterShow").hide();
    $("#map_page .content .filterPosition #filterHide").show();
  } else {
    $("#map_page .content .filterPosition #filterShow").show();
    $("#map_page .content .filterPosition #filterHide").hide();
  }
}
function MarkerDirectionsMap(_posOriginal, _posDestination, ID, NAME) {
  if (infowindowDestination) {
    infowindowDestination.close();
  }
  for (let i = 0; i < markers.length; i++) {
    if (ID != markers[i]["id"]) {
      markers[i].setOptions({ visible: false });
    } else {
      // closeOtherInfo();
      infowindowDestination = new google.maps.InfoWindow();
      var contentString = "";
      if (typeDataMap == "elder") {
        contentString =
          '<div id="bodyMapPagemarkerContent"><p>' + NAME + "</p>" + "</div>";
      } else if (typeDataMap == "office") {
        contentString =
          '<div id="bodyMapPagemarkerContentOffice"><p>' +
          NAME +
          "</p>" +
          "</div>";
      } else if (typeDataMap == "shph") {
        contentString =
          '<div id="bodyMapPagemarkerContentShph"><p>' +
          NAME +
          "</p>" +
          "</div>";
      }
      infowindowDestination.setContent(contentString);
      infowindowDestination.open(map, markers[i]);
    }
  }
  // Create setCenterMap.
  let strokeColor = "red";
  if (typeDataMap == "elder") {
    strokeColor = "red";
  } else if (typeDataMap == "office") {
    strokeColor = "darkorange";
  } else if (typeDataMap == "shph") {
    strokeColor = "blue";
  }
  map.setCenter(_posOriginal);
  map.setOptions({
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
  });
  MapPagedirectionsRenderer.setOptions({
    suppressPolylines: false,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: strokeColor,
    },
  });
  MapPagedirectionsRenderer.setMap(map);
  calculateAndDisplayRoute(
    MapPagedirectionsService,
    MapPagedirectionsRenderer,
    _posOriginal,
    _posDestination
  );
  // Create markerOriginal.
  markerOriginal = new google.maps.Marker({
    position: _posOriginal,
    icon: "img/dot.png",
    map: map,
  });
  // Set bodyMarkerContent
  var contentStringDes =
    '<div id="bodyMarkerContent" style="background-image: unset;justify-content: center;background-color: #45D0A5;"><p>ตำแหน่งของคุณ</p>' +
    "</div>";
  infowindowOriginal = new google.maps.InfoWindow();
  infowindowOriginal.setContent(contentStringDes);
  infowindowOriginal.open(map, markerOriginal);
}
function calculateAndDisplayRoute(
  MapPagedirectionsService,
  MapPagedirectionsRenderer,
  posOriginal,
  posDestination
) {
  MapPagedirectionsService.route({
    origin: posOriginal,
    destination: posDestination,
    travelMode: google.maps.TravelMode.DRIVING,
  })
    .then((response) => {
      MapPagedirectionsRenderer.setDirections(response);
    })
    .catch();
}
// ปิด route
$("#map_page .content #elderContentFixed").on("click", function () {
  if (typeDataMap == "elder") {
    initialelderFunc();
  } else if (typeDataMap == "office") {
    initialofficeFunc();
  } else if (typeDataMap == "shph") {
    initialshphFunc();
  }
});
// ดกปุ่มเลือก ผู้สูงอายุ
$(
  "#map_page .content .selecePosition .card-body .btn_select_group button#elder"
).on("click", function () {
  initialelderFunc();
});
// กดปุ่มเลือก อบต
$(
  "#map_page .content .selecePosition .card-body .btn_select_group button#office"
).on("click", function () {
  initialofficeFunc();
});
function initialofficeFunc() {
  typeDataMap = "office";
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  $("#map_page .content .filterPosition #filterShow").show();
  $("#map_page .content .filterPosition #filterHide").hide();
  $("#map_page .content .selecePosition").show();
  $("#map_page .content #elderContentFixed").hide();
  $("#map_page .footer").show();
  $("#map_page .content").css("bottom", "70px");
  $(
    "#map_page .content .filterPosition #filterShow #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .filterPosition #filterHide #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button"
  ).removeClass("active");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button#office"
  ).addClass("active");
  loading.show();
  callAPI(
    `${api_base_url}/getOfficePage`,
    "POST",
    JSON.stringify({
      token: token.getUserToken(),
      item_order: "OFFICE_NAME",
      GIS_PROVINCE: gisProvinces,
      item_direction: "ASC",
    }),
    (res) => {
      loading.hide();
      if (res.status) {
        ListOfficeMap = res.data.data;
        $.each(ListOfficeMap, function (index, row) {
          if (row.OFFICE_LAT != "null" && row.OFFICE_LONG != "null") {
            row.DISTANCE = getDistanceFromLatLonInKm(
              PosCurrent.lat,
              PosCurrent.long,
              row.OFFICE_LAT,
              row.OFFICE_LONG
            ).toFixed(1);
          } else {
            row.DISTANCE = "N/A";
          }
          row.CURRENT_LAT = PosCurrent.lat;
          row.CURRENT_LONG = PosCurrent.long;
        });
        MarkerMap(ListOfficeMap);
      } else {
      }
    },
    (err) => {}
  );
}

// กดปุ่มเลือก โรงพยาบาล
$(
  "#map_page .content .selecePosition .card-body .btn_select_group button#shph"
).on("click", function () {
  initialshphFunc();
});
function initialshphFunc() {
  typeDataMap = "shph";
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  $("#map_page .content .filterPosition #filterShow").show();
  $("#map_page .content .filterPosition #filterHide").hide();
  $("#map_page .content .selecePosition").show();
  $("#map_page .content #elderContentFixed").hide();
  $("#map_page .footer").show();
  $("#map_page .content").css("bottom", "70px");
  $(
    "#map_page .content .filterPosition #filterShow #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .filterPosition #filterHide #destination_position p"
  ).text("กำหนดจุดหมาย");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button"
  ).removeClass("active");
  $(
    "#map_page .content .selecePosition .card-body .btn_select_group button#shph"
  ).addClass("active");
  loading.show();
  callAPI(
    `${api_base_url}/getShphPage`,
    "POST",
    JSON.stringify({
      token: token.getUserToken(),
      item_order: "SHPH_NAME",
      GIS_PROVINCE: gisProvinces,
      item_direction: "ASC",
    }),
    (res) => {
      loading.hide();
      if (res.status) {
        ListShphMap = res.data.data;
        $.each(ListShphMap, function (index, row) {
          if (row.SHPH_LAT != "null" && row.SHPH_LONG != "null") {
            row.DISTANCE = getDistanceFromLatLonInKm(
              PosCurrent.lat,
              PosCurrent.long,
              row.SHPH_LAT,
              row.SHPH_LONG
            ).toFixed(1);
          } else {
            row.DISTANCE = "N/A";
          }
          row.CURRENT_LAT = PosCurrent.lat;
          row.CURRENT_LONG = PosCurrent.long;
        });
        MarkerMap(ListShphMap);
      } else {
      }
    },
    (err) => {}
  );
}
/* ----------------------------------------------------------------------------- end : map_page ----------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- start : map_elder_list_page ----------------------------------------------------------------------------- */
function initialMapElderListPageFunc() {
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  if (typeDataMap == "elder") {
    $("#map_elder_list_page .title").text("รายชื่อทั้งหมด");
    rendermap_elder_list_page(ListElderMap);
  } else if (typeDataMap == "office") {
    $("#map_elder_list_page .title").text("อบต ทั้งหมด");
    rendermap_elder_list_page(ListOfficeMap);
  } else if (typeDataMap == "shph") {
    $("#map_elder_list_page .title").text("โรงพยาบาลทั้งหมด");
    rendermap_elder_list_page(ListShphMap);
  }
  $("#map_elder_list_page .content p").hide();
  $("#map_elder_list_page .search_header input").val("");
}
// ปุ่ม กำหนดจุดหมาย
$("#map_page .content .filterPosition #destination_position").on(
  "click",
  function () {
    if ($("#map_page .content .filterPosition #filterHide").is(":visible")) {
      toggleFilter();
    } else {
      changePage("map_elder_list_page", function () {
        initialMapElderListPageFunc();
      });
    }
  }
);
function rendermap_elder_list_page(elderArr) {
  $("#map_elder_list_page .content ul.contact_items").empty();
  let elderViewHTML = "";
  if (typeDataMap == "elder") {
    $.each(elderArr, function (index, row) {
      let distanceelderText = "ไม่พบพิกัด";
      if (row.DISTANCE != "N/A") {
        distanceelderText = "ห่างจากคุณ " + row.DISTANCE + " km.";
      }
      elderViewHTML =
        elderViewHTML +
        `<li onclick="selectElderMap(${row.ID})">
          <div class="notifications-card-body">
            <img class="card-body-thumbnail" src="${row.ELDER_AVATAR}" />
            <div class="card-body-content">
              <h4 class="name">${row.ELDER_NAME}</h4>
              <div style="display: flex">
                <h5 class="urgent">
                  <i class="fa fa-crosshairs" aria-hidden="true"></i> ระยะทาง
                </h5>
                <h5 class="urgent" style="color: #6f63fd; padding-left: 5px">
                ${distanceelderText}
                </h5>
              </div>
            </div>
            <i
              class="right-icon fa fa-map-marker fa-lg"
              aria-hidden="true"
            ></i>
          </div>
        </li>`;
    });
  } else if (typeDataMap == "office") {
    $.each(elderArr, function (index, row) {
      let distanceelderText = "ไม่พบพิกัด";
      if (row.DISTANCE != "N/A") {
        distanceelderText = "ห่างจากคุณ " + row.DISTANCE + " km.";
      }
      elderViewHTML =
        elderViewHTML +
        `<li onclick="selectElderMap(${row.ID})">
          <div class="notifications-card-body">
            <img class="card-body-thumbnail" src="img/home_icon.png" />
            <div class="card-body-content">
              <h4 class="name">${row.OFFICE_NAME}</h4>
              <div style="display: flex">
                <h5 class="urgent">
                  <i class="fa fa-crosshairs" aria-hidden="true"></i> ระยะทาง
                </h5>
                <h5 class="urgent" style="color: #6f63fd; padding-left: 5px">
                ${distanceelderText}
                </h5>
              </div>
            </div>
            <i
              class="right-icon fa fa-map-marker fa-lg"
              aria-hidden="true"
            ></i>
          </div>
        </li>`;
    });
  } else if (typeDataMap == "shph") {
    $.each(elderArr, function (index, row) {
      let distanceelderText = "ไม่พบพิกัด";
      if (row.DISTANCE != "N/A") {
        distanceelderText = "ห่างจากคุณ " + row.DISTANCE + " km.";
      }
      elderViewHTML =
        elderViewHTML +
        `<li onclick="selectElderMap(${row.ID})">
          <div class="notifications-card-body">
            <img class="card-body-thumbnail" src="img/home_icon.png" />
            <div class="card-body-content">
              <h4 class="name">${row.SHPH_NAME}</h4>
              <div style="display: flex">
                <h5 class="urgent">
                  <i class="fa fa-crosshairs" aria-hidden="true"></i> ระยะทาง
                </h5>
                <h5 class="urgent" style="color: #6f63fd; padding-left: 5px">
                ${distanceelderText}
                </h5>
              </div>
            </div>
            <i
              class="right-icon fa fa-map-marker fa-lg"
              aria-hidden="true"
            ></i>
          </div>
        </li>`;
    });
  }

  $("#map_elder_list_page .content ul.contact_items").append(elderViewHTML);
}
// ปุ่ม search
$("#map_elder_list_page .urgent_noti_page_header .search_header").on(
  "click",
  function () {
    if ($(".search_header").hasClass("active")) {
      searchremoveClass();
    } else {
      $("#map_elder_list_page ul.news_item").html("");
      $("#map_elder_list_page .content .title-bar").hide();
      $("#map_elder_list_page .content .slide-bar").hide();
      $("#map_elder_list_page .content .sort-bar").hide();
      $(".search_header input").addClass("active");
      setTimeout(function () {
        $(".search_header input").focus();
        $(".search_header input").select();
      }, 10);
      $(".search_header input").prop("disabled", false);
      $(".search_header").addClass("active");
      $(".urgent_noti_page_header .title").hide();
      let searchInputMap = document.querySelector(
        "#map_elder_list_page .search_header input"
      );
      searchInputMap.removeEventListener("input", inputChangeMap);
      searchInputMap.addEventListener("input", inputChangeMap);
    }
  }
);
function inputChangeMap(e) {
  if (typeDataMap == "elder") {
    var sreachArr = searchFunction(ListElderMap, "ELDER_NAME", e.target.value);
    rendermap_elder_list_page(sreachArr);
  } else if (typeDataMap == "office") {
    var sreachArr = searchFunction(
      ListOfficeMap,
      "OFFICE_NAME",
      e.target.value
    );
    rendermap_elder_list_page(sreachArr);
  } else if (typeDataMap == "shph") {
    var sreachArr = searchFunction(ListShphMap, "SHPH_NAME", e.target.value);
    rendermap_elder_list_page(sreachArr);
  }

  if (sreachArr.length > 0) {
    $("#map_elder_list_page .content p").show();
    $("#map_elder_list_page .content p").text(
      "ตรงกับที่ค้นหา " + sreachArr.length + " รายการ"
    );
  } else {
    $("#map_elder_list_page .content p").hide();
  }
}
function searchremoveClass() {
  $("#map_elder_list_page .content .title-bar").show();
  $("#map_elder_list_page .content .slide-bar").show();
  $("#map_elder_list_page .content .sort-bar").show();
  $(".search_header input").removeClass("active");
  $(".search_header input").prop("disabled", true);
  $(".search_header").removeClass("active");
  $("#qtyitemsearch").hide();
  $(".urgent_noti_page_header .title").show();
}
// selectElderMap
function selectElderMap(ID) {
  if (typeDataMap == "elder") {
    TempElderMap = ListElderMap.filter((x) => x.ID == ID)[0];
    if (TempElderMap["DISTANCE"] == "N/A") {
      alert("ไม่พบพิกัด");
    } else {
      let distanceelderText = "ไม่พบพิกัด";
      if (TempElderMap.DISTANCE != "N/A") {
        distanceelderText = "ห่างจากคุณ " + TempElderMap.DISTANCE + " km.";
      }
      changePage("map_page", function () {
        $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
          "src",
          TempElderMap["ELDER_AVATAR"]
        );
        $(
          "#map_page .content .elder_content_fixed .card-body-content .name"
        ).text(TempElderMap["ELDER_NAME"]);
        $("#map_page .content .elder_content_fixed .card-body-content h5")
          .eq(1)
          .text(distanceelderText);
        routeMap(TempElderMap["ID"]);
      });
    }
  } else if (typeDataMap == "office") {
    TempOfficeMap = ListOfficeMap.filter((x) => x.ID == ID)[0];
    if (TempOfficeMap["DISTANCE"] == "N/A") {
      alert("ไม่พบพิกัด");
    } else {
      let distanceofficeText = "ไม่พบพิกัด";
      if (TempOfficeMap.DISTANCE != "N/A") {
        distanceofficeText = "ห่างจากคุณ " + TempOfficeMap.DISTANCE + " km.";
      }
      changePage("map_page", function () {
        $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
          "src",
          "img/home_icon.png"
        );
        $(
          "#map_page .content .elder_content_fixed .card-body-content .name"
        ).text(TempOfficeMap["OFFICE_NAME"]);
        $("#map_page .content .elder_content_fixed .card-body-content h5")
          .eq(1)
          .text(distanceofficeText);
        routeMap(TempOfficeMap["ID"]);
      });
    }
  } else if (typeDataMap == "shph") {
    TempShphMap = ListShphMap.filter((x) => x.ID == ID)[0];
    if (TempShphMap["DISTANCE"] == "N/A") {
      alert("ไม่พบพิกัด");
    } else {
      let distanceofficeText = "ไม่พบพิกัด";
      if (TempShphMap.DISTANCE != "N/A") {
        distanceofficeText = "ห่างจากคุณ " + TempShphMap.DISTANCE + " km.";
      }
      changePage("map_page", function () {
        $("#map_page .content .elder_content_fixed .card-body-thumbnail").attr(
          "src",
          "img/home_icon.png"
        );
        $(
          "#map_page .content .elder_content_fixed .card-body-content .name"
        ).text(TempShphMap["SHPH_NAME"]);
        $("#map_page .content .elder_content_fixed .card-body-content h5")
          .eq(1)
          .text(distanceofficeText);
        routeMap(TempShphMap["ID"]);
      });
    }
  }
}
// ปุ่ม back
$("#map_elder_list_page .urgent_noti_page_header .back_header_btn").on(
  "click",
  function () {
    changePage("map_page", function () {
      if (typeDataMap == "elder") {
        initialelderFunc();
      } else if (typeDataMap == "office") {
        initialofficeFunc();
      } else if (typeDataMap == "shph") {
        initialshphFunc();
      }
    });
  }
);


$('.map_header_btn').on('click',function(){
    $('#map_page .footer_item.menu_map_page').click()
})
/* ----------------------------------------------------------------------------- end : map_elder_list_page ----------------------------------------------------------------------------- */
