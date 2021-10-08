var swiper_urgent_noti;
let toturialvideo = document.getElementById("toturialvideo");
$(function () {
  $('.footer_item.menu_urgent_page').on('click',function(){
    loading.show();
    var status = navigator.onLine;
    if (status) {
      if (CurrentPosUrgentNoti) {
        setTimeout(function () {
          loading.hide();
          changePage("urgent_noti_page", function () {
            initialUrgentNotiPageFunc();
            toturialvideo.currentTime = 0;
            toturialvideo.play();
            toturialvideo.loop = true;
            showModal("modal-tutorial-urgent-noti");
          });
        }, 500);
      } else {
        loading.hide();
        let chkPos = confirm("กรุณาอุนญาติตำแหน่ง");
        if (chkPos) {
          document.addEventListener(
            "deviceready",
            onDeviceUrgentPageReady,
            false
          );
        } else {
        }
      }
    } else {
      alert("กรุณาเชื่อมต่ออินเตอร์เน็ต");
      loading.hide();
    }
  })

});
function onDeviceUrgentPageReady() {
  navigator.geolocation.getCurrentPosition(
    onSuccessUrgentPage,
    onErrorUrgentPage,
    {
      enableHighAccuracy: true,
    }
  );
}
function onSuccessUrgentPage(pos) {
  CurrentPosUrgentNoti = pos;
  changePage("map_page", function () {
    initialMapPageFunc();
    setTimeout(function () {
      loading.hide();
    }, 500);
  });
}
function onErrorUrgentPage(error) {
  alert("ไม่สามารถเข้าถึงตำแหน่งได้");
}
var markerOriginal;
var infowindowOriginal;
var markerDestination;
var infowindowDestination;

var directionsService;
var directionsRenderer;
// var CurrentPosUrgentNoti;
var ListElderUrgentNoti;
var TempElderUrgentNoti;
var ListEmcType;
var imgPreviewArr = [];
var telStaffArr = [];
let SaveData = {};
function initialUrgentNotiPageFunc() {
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  initialSearchHeaderFunc();
  initMapUrgentNotiPage();
  if (directionsRenderer) {
    directionsRenderer.setDirections({ routes: [] });
  }
  if (markerOriginal) {
    markerOriginal.setOptions({ visible: false });
  }
  if (markerDestination) {
    markerDestination.setOptions({ visible: false });
  }
  if (infowindowOriginal) {
    infowindowOriginal.close();
  }
  if (infowindowDestination) {
    infowindowDestination.close();
  }
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  $("#urgent_noti_page .content .elder_detail").hide();
  $("#urgent_noti_page .DetailElder").show();
  $("#urgent_noti_page .mapContent").removeClass("active");
  $("#urgent_noti_page .content").removeClass("active");
  $("#urgent_noti_page .content .backformap").hide();
  $("#urgent_noti_page .UrgentDetailElder").hide();
  $("#urgent_noti_page .urgent_detail_noti_page_header").hide();
  $("#urgent_noti_page .urgent_noti_page_header").show();
  $("#urgent_noti_page .notifications-card-body").removeClass("active");
  $("#urgent_noti_page .swiper_elder_content").show();
  $("#urgent_noti_page .swiper_elder_content_fixed").hide();
  $("#urgent_noti_page .content .backformap button").hide();
  $("#urgent_noti_page .content .backformap .backformap_btn").show();
  $("#urgent_noti_page .urgent_noti_page_header .title").show();
  $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn").show();
  $("#type_urgent").empty();
  $("#urgent_noti_page .DetailElder .camera .PreImg").empty();
  ListEmcType;
  imgPreviewArr = [];
  telStaffArr = [];
  SaveData = {};
  // queryALL("VHV_TR_EMERGENCY", function (res) {
  //   let countEmc = 0;
  //   $.each(res, function (key, row) {
  //     if (row["DELETE_FLAG"] == "0") {
  //       countEmc += 1;
  //     }
  //     $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn p").text(
  //       countEmc
  //     );
  //   });
  // });
  let countEmc = 0;
  callAPI(
    `${api_base_url}/getCountEmergency`,
    "POST",
    JSON.stringify({ token: token.getUserToken() }),
    (res) => {
      if (res.data) {
        countEmc = res.data;
        $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn p").text(
          countEmc
        );
      } else {
        $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn p").text(
          countEmc
        );
      }
    },
    (err) => {
      $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn p").text(
        countEmc
      );
    }
  );
  queryALL("VHV_MA_EMCTYPE", function (res) {
    ListEmcType = res;
    $("#type_urgent").append(
      $("<option></option>")
        .attr("value", "")
        .text("ประเภทเหตุด่วน")
        .prop("selected", true)
    );
    $.each(ListEmcType, function (key, value) {
      if (value["DELETE_FLAG"] == "0") {
        $("#type_urgent").append(
          $("<option></option>")
            .attr("value", value["ID"])
            .text(value["EMC_NAME"])
        );
      }
    });
  });
  disabledElderUrgentNotiPageFunc();
  queryALL("VHV_TR_ELDER", function (res) {
    ListElderUrgentNoti = res;
    $.each(ListElderUrgentNoti, function (index, row) {
      if (row.ELDER_LAT != "null" && row.ELDER_LONG != "null") {
        row.DISTANCE = getDistanceFromLatLonInKm(
          CurrentPosUrgentNoti.coords.latitude,
          CurrentPosUrgentNoti.coords.longitude,
          row.ELDER_LAT,
          row.ELDER_LONG
        ).toFixed(1);
      } else {
        row.DISTANCE = "N/A";
      }
      row.CURRENT_LAT = CurrentPosUrgentNoti.coords.latitude;
      row.CURRENT_LONG = CurrentPosUrgentNoti.coords.longitude;
    });
    $("#urgent_noti_page .content .mapContent .swiper_elder_content").empty();
    $("#urgent_noti_page .content .mapContent .swiper_elder_content").append(
      renderElderCardUrgentNoti(ListElderUrgentNoti)
    );
    // กดเลือกผู้สูงอายุตรง map
    $("#urgent_noti_page .swiper_elder_content .notifications-card-body").on(
      "click",
      function () {
        if (markerDestination) {
          markerDestination.setOptions({ visible: false });
        }
        if (infowindowDestination) {
          infowindowDestination.close();
        }
        let ID = $(this).attr("ELDER_ID");
        TempElderUrgentNoti = ListElderUrgentNoti.filter((x) => x.ID == ID)[0];
        $("#urgent_noti_page .notifications-card-body").removeClass("active");
        if (
          TempElderUrgentNoti["ELDER_LAT"] != "null" &&
          TempElderUrgentNoti["ELDER_LONG"]
        ) {
          $(this).addClass("active");
          MarkerUrgentNotiPage(
            TempElderUrgentNoti["ELDER_NAME"],
            new google.maps.LatLng(
              TempElderUrgentNoti["ELDER_LAT"],
              TempElderUrgentNoti["ELDER_LONG"]
            )
          );
          enabledElderUrgentNotiPageFunc();
        }
      }
    );
    initSlideUrgentNotiPage();
  });
  // queryALL("VHV_TR_ELDER", function (res) {
  //   ListElderUrgentNoti = res;
  //   $.each(ListElderUrgentNoti, function (index, row) {
  //     if (row.ELDER_LAT != "null" && row.ELDER_LONG != "null") {
  //       row.DISTANCE = getDistanceFromLatLonInKm(
  //         16.442611448372272,
  //         102.82001846528836,
  //         row.ELDER_LAT,
  //         row.ELDER_LONG
  //       ).toFixed(1);
  //     } else {
  //       row.DISTANCE = "N/A";
  //     }
  //     row.CURRENT_LAT = 16.442611448372272;
  //     row.CURRENT_LONG = 102.82001846528836;
  //   });
  //   $("#urgent_noti_page .content .mapContent .swiper_elder_content").empty();
  //   $("#urgent_noti_page .content .mapContent .swiper_elder_content").append(
  //     renderElderCardUrgentNoti(ListElderUrgentNoti)
  //   );
  //   // กดเลือกผู้สูงอายุตรง map
  //   $("#urgent_noti_page .swiper_elder_content .notifications-card-body").on(
  //     "click",
  //     function () {
  //       if (markerDestination) {
  //         markerDestination.setOptions({ visible: false });
  //       }
  //       if (infowindowDestination) {
  //         infowindowDestination.close();
  //       }
  //       let ID = $(this).attr("ELDER_ID");
  //       TempElderUrgentNoti = ListElderUrgentNoti.filter((x) => x.ID == ID)[0];
  //       $("#urgent_noti_page .notifications-card-body").removeClass("active");
  //       if (
  //         TempElderUrgentNoti["ELDER_LAT"] != "null" &&
  //         TempElderUrgentNoti["ELDER_LONG"]
  //       ) {
  //         $(this).addClass("active");
  //         MarkerUrgentNotiPage(
  //           TempElderUrgentNoti["ELDER_NAME"],
  //           new google.maps.LatLng(
  //             TempElderUrgentNoti["ELDER_LAT"],
  //             TempElderUrgentNoti["ELDER_LONG"]
  //           )
  //         );
  //         enabledElderUrgentNotiPageFunc();
  //       }
  //     }
  //   );
  //   initSlideUrgentNotiPage();
  // });
}
function renderElderCardUrgentNoti(elderData) {
  let slideHTML = "";
  $.each(elderData, function (index, row) {
    let distanceText = "ไม่พบพิกัด";
    if (row.DISTANCE != "N/A") {
      distanceText = "ห่างจากคุณ " + row.DISTANCE + " km.";
    }
    slideHTML =
      slideHTML +
      `<div class="swiper-slide" style="background-color: unset">
        <div class="notifications-card-body" ELDER_ID="${row.ID}">
          <img class="card-body-thumbnail" src="${row.ELDER_AVATAR}" />
          <div class="card-body-content">
            <h4 class="name">${row.ELDER_NAME}</h4>
            <div style="display: flex">
              <h5 class="urgent">
                <i class="fa fa-crosshairs" aria-hidden="true"></i>
                ระยะทาง
              </h5>
              <h5
                class="urgent"
                style="color: #6f63fd; padding-left: 5px"
              >
                ${distanceText}
              </h5>
            </div>
          </div>
        </div>
      </div>`;
  });
  return (
    `<div class="swiper swiper_urgent_noti">
  <div class="swiper-wrapper">` +
    slideHTML +
    `</div>
  </div>`
  );
}
function disabledElderUrgentNotiPageFunc() {
  $("#urgent_noti_page .step-footer .btn_group .submit_noti").prop(
    "disabled",
    true
  );
  $("#urgent_noti_page .DetailElder .elder_btn").prop("disabled", true);
  $("#urgent_noti_page .DetailElder #type_urgent").prop("disabled", true);
  $("#urgent_noti_page .DetailElder #subject_urgent").prop("disabled", true);
  $("#urgent_noti_page .DetailElder #detail_urgent").prop("disabled", true);
  $("#urgent_noti_page .DetailElder #subject_urgent").val("");
  $("#urgent_noti_page .DetailElder #detail_urgent").val("");
  $("#urgent_noti_page .DetailElder .elder p").text("");
  $("#urgent_noti_page .DetailElder .tel").hide();
  $("#urgent_noti_page .DetailElder #edit_icon").attr(
    "src",
    "img/edit_icon_disabled.png"
  );
  $("#urgent_noti_page .DetailElder #edit_title_text").addClass(
    "edit_title_text"
  );
  $("#urgent_noti_page .DetailElder #edit_title").addClass(
    "edit_title_disabled"
  );
  $("#urgent_noti_page .DetailElder .camera .Img").hide();
  $("#urgent_noti_page .DetailElder .camera .open_camera").addClass("disabled");
  $("#urgent_noti_page .content .elder .elder_btn").text("แสดงข้อมูล");
  $("#urgent_noti_page .content .elder_detail").hide();
  $("#urgent_noti_page .content .elder .elder_btn").removeClass("show");
}
function enabledElderUrgentNotiPageFunc() {
  let elder_detail_age = getAge(TempElderUrgentNoti["ELDER_BIRTHDATE"]);
  let health_status_text = "ไม่มีข้อมูล";
  if (TempElderUrgentNoti["HEALTH_STATUS"] == 1) {
    health_status_text = "ผู้สูงอายุ “แข็งแรง”";
  } else if (TempElderUrgentNoti["HEALTH_STATUS"] == 2) {
    health_status_text = "ผู้สูงอายุ “พยุงเดิน”";
  } else if (TempElderUrgentNoti["HEALTH_STATUS"] == 3) {
    health_status_text = "ผู้สูงอายุ “ติดเตียง”";
  } else {
    health_status_text = "ไม่มีข้อมูล";
  }
  $("#urgent_noti_page .step-footer .btn_group .submit_noti").prop(
    "disabled",
    false
  );
  $("#urgent_noti_page .DetailElder .elder_btn").prop("disabled", false);
  $("#urgent_noti_page .DetailElder #type_urgent").prop("disabled", false);
  $("#urgent_noti_page .DetailElder #subject_urgent").prop("disabled", false);
  $("#urgent_noti_page .DetailElder #detail_urgent").prop("disabled", false);
  $("#urgent_noti_page .DetailElder .elder p").text(
    TempElderUrgentNoti["ELDER_NAME"]
  );
  $("#urgent_noti_page .DetailElder .elder_detail #elder_detail_name").text(
    TempElderUrgentNoti["ELDER_NAME"]
  );
  $("#urgent_noti_page .DetailElder .elder_detail #elder_detail_age").text(
    elder_detail_age
  );
  $("#urgent_noti_page .DetailElder .elder_detail .health p").text(
    health_status_text
  );
  queryGetDiseaseByELDER_ID(
    "VHV_TR_VISIT",
    TempElderUrgentNoti["ID"],
    function (res) {
      $(
        "#urgent_noti_page .DetailElder .elder_detail .col_elder_data.disease"
      ).empty();
      $(
        "#urgent_noti_page .DetailElder .elder_detail #elder_detail_caretaker_tel"
      ).text("ไม่มีข้อมูล");
      let strDisease = res[0]["VISIT1_DESC"];
      let diseaseArr = ["ไม่มีข้อมูล"];
      if (strDisease != null) {
        diseaseArr = strDisease.split(" ");
      }
      $("#urgent_noti_page .DetailElder .elder_detail #telStaff").empty();
      if (res[0]["VISIT2B"] != null) {
        if (res[0]["VISIT2B"] == "1") {
          $(
            "#urgent_noti_page .DetailElder .elder_detail #elder_detail_caretaker_tel"
          ).text(res[0]["VISIT2B_TEL1"]);
          $("#urgent_noti_page .DetailElder .elder_detail #telStaff").append(
            `<p><a href="tel:${res[0]["VISIT2B_TEL1"]}">โทรออก</a></p>`
          );
        } else if (res[0]["VISIT2B"] == "2") {
          $(
            "#urgent_noti_page .DetailElder .elder_detail #elder_detail_caretaker_tel"
          ).text(res[0]["VISIT2B_TEL2"]);
          $("#urgent_noti_page .DetailElder .elder_detail #telStaff").append(
            `<p><a href="tel:${res[0]["VISIT2B_TEL2"]}">โทรออก</a></p>`
          );
        }
      }
      let diseaseHTML = "";
      $.each(diseaseArr, function (index, row) {
        diseaseHTML =
          diseaseHTML +
          `<div class="congenital_disease">
            <p>${row}</p>
          </div>`;
      });
      $(
        "#urgent_noti_page .DetailElder .elder_detail .col_elder_data.disease"
      ).append(diseaseHTML);
    }
  );
  $("#urgent_noti_page .DetailElder .tel").show();
  $("#urgent_noti_page .DetailElder #edit_icon").attr(
    "src",
    "img/edit_icon.png"
  );
  $("#urgent_noti_page .DetailElder #edit_title_text").removeClass(
    "edit_title_text"
  );
  $("#urgent_noti_page .DetailElder #edit_title").removeClass(
    "edit_title_disabled"
  );
  $("#urgent_noti_page .DetailElder .camera .Img").show();
  $("#urgent_noti_page .DetailElder .camera .open_camera").removeClass(
    "disabled"
  );
}

function initMapUrgentNotiPage() {
  map = new google.maps.Map(document.getElementById("mapUrgentNotiPage"), {
    center: new google.maps.LatLng(
      CurrentPosUrgentNoti.coords.latitude,
      CurrentPosUrgentNoti.coords.longitude
    ), //new google.maps.LatLng(-33.91722, 151.2263),
    zoom: 16,
    disableDefaultUI: true,
    mapTypeControl: false,
  });
  // // Configure the click listener.
  // map.addListener("click", (mapsMouseEvent) => {
  //   // Create a new InfoWindow.
  //   var infoWindow = new google.maps.InfoWindow({
  //     position: mapsMouseEvent.latLng,
  //   });
  //   console.log(infoWindow.getContent());
  //   infoWindow.setContent(
  //     JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
  //   );
  //   infoWindow.open(map);
  //   // Close the current InfoWindow.
  //   infoWindow.close();
  // });
}
function initSlideUrgentNotiPage() {
  if (swiper_urgent_noti) {
    swiper_urgent_noti.destroy();
    swiper_urgent_noti = null;
  }
  swiper_urgent_noti = new Swiper(".swiper_urgent_noti", {
    speed: 400,
    spaceBetween: 100,
  });
}
function MarkerDirectionsUrgentNotiPage(_name, _posDestination) {
  _posOriginal = {
    lat: TempElderUrgentNoti["CURRENT_LAT"],
    lng: TempElderUrgentNoti["CURRENT_LONG"],
  };
  // Create setCenterMap.
  map.setCenter(_posOriginal);
  directionsRenderer.setOptions({
    suppressPolylines: false,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "red",
    },
  });
  directionsRenderer.setMap(map);
  calculateAndDisplayRoute(
    directionsService,
    directionsRenderer,
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
    '<div id="bodyMarkerContent" style="background-image: unset;justify-content: center;"><p>ตำแหน่งของคุณ</p>' +
    "</div>";
  infowindowOriginal = new google.maps.InfoWindow();
  infowindowOriginal.setContent(contentStringDes);
  infowindowOriginal.open(map, markerOriginal);
  // ปุ่ม กลับหน้า map
  $("#urgent_noti_page .backformap .backformap_btn").on("click", function () {
    $("#urgent_noti_page .urgent_noti_page_header").show();
    $("#urgent_noti_page .urgent_detail_noti_page_header").show();
    $("#urgent_noti_page .content").css("top", "60px");
    $("#urgent_noti_page .mapContent").removeClass("active");
    $(
      '#urgent_noti_page .notifications-card-body[ELDER_ID="' +
        TempElderUrgentNoti["ID"] +
        '"]'
    ).addClass("active");
    $("#urgent_noti_page .swiper_elder_content").show();
    $("#urgent_noti_page .DetailElder").show();
    $("#urgent_noti_page .content").removeClass("active");
    $("#urgent_noti_page .content .backformap").hide();
    directionsRenderer.setMap(null);
    map.setCenter(_posDestination);
    map.setZoom(15);
    infowindowOriginal.close();
    markerOriginal.setOptions({ visible: false });
  });
}
function calculateAndDisplayRoute(
  directionsService,
  directionsRenderer,
  posOriginal,
  posDestination
) {
  directionsService
    .route({
      origin: posOriginal,
      destination: posDestination,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
    })
    .catch();
}
function MarkerUrgentNotiPage(_name, _posDestination) {
  // Create markerDestination.
  markerDestination = new google.maps.Marker({
    position: _posDestination,
    icon: "img/pin_marker.png",
    map: map,
  });
  // markers.push(markerDestination);
  map.setCenter(_posDestination);
  // Set bodyMarkerContent
  var contentString =
    '<div id="bodyMarkerContent" onclick="showFullMap()"><p>' +
    _name +
    "</p>" +
    "</div>";
  infowindowDestination = new google.maps.InfoWindow();
  infowindowDestination.setContent(contentString);
  infowindowDestination.open(map, markerDestination);
}
// กดชื่อบน marker
function showFullMap() {
  $("#urgent_noti_page .urgent_noti_page_header").hide();
  $("#urgent_noti_page .urgent_detail_noti_page_header").hide();
  $("#urgent_noti_page .content").css("top", "0px");

  $("#urgent_noti_page .content .backformap").removeClass("to_notifications");
  if ($(".backformap_to_notifications_page_btn").is(":visible")) {
    $("#urgent_noti_page .content .backformap button").hide();
    $(
      "#urgent_noti_page .content .backformap .backformap_urgent_detail_btn"
    ).show();
  } else {
    $("#urgent_noti_page .content .backformap button").hide();
    $("#urgent_noti_page .content .backformap .backformap_btn").show();
  }
  if (!$("#urgent_noti_page .mapContent").hasClass("active")) {
    MarkerDirectionsUrgentNotiPage(
      TempElderUrgentNoti["ELDER_NAME"],
      new google.maps.LatLng(
        TempElderUrgentNoti["ELDER_LAT"],
        TempElderUrgentNoti["ELDER_LONG"]
      )
    );
    $("#urgent_noti_page .mapContent").addClass("active");
    $("#urgent_noti_page .notifications-card-body").removeClass("active");
    $("#urgent_noti_page .swiper_elder_content").hide();
    $("#urgent_noti_page .DetailElder").hide();
    $("#urgent_noti_page .UrgentDetailElder").hide();
    $("#urgent_noti_page .content").addClass("active");
    $("#urgent_noti_page .content .backformap .card-body img").attr(
      "src",
      TempElderUrgentNoti["ELDER_AVATAR"]
    );
    $(
      "#urgent_noti_page .content .backformap .card-body .card-body-content h4"
    ).text(TempElderUrgentNoti["ELDER_NAME"]);
    $("#urgent_noti_page .content .backformap .card-body .card-body-content h5")
      .eq(1)
      .text("ห่างจากคุณ " + TempElderUrgentNoti["DISTANCE"] + " km.");
    $("#urgent_noti_page .content .backformap").show();
    $("#urgent_noti_page .swiper_elder_content_fixed").hide();
    $("#urgent_noti_page .content .backformap .card-body").eq(0).show();
  }
}
// ปุ่มยกเลิก
$(
  "#urgent_noti_page .step-footer.urgent_noti_page_step-footer button.cancel_noti"
).on("click", function () {
  changePage("home_page", function () {});
});
// ปุ่มส่งเรื่อง
$(
  "#urgent_noti_page .step-footer.urgent_noti_page_step-footer button.submit_noti"
).on("click", function () {
  let EMC_DATE_NEW = new Date();

  let month = EMC_DATE_NEW.getMonth() + 1;
  let day = EMC_DATE_NEW.getDate();
  let EMC_DATE_TEXT =
    EMC_DATE_NEW.getFullYear() +
    "-" +
    (("" + month).length < 2 ? "0" : "") +
    month +
    "-" +
    (("" + day).length < 2 ? "0" : "") +
    day +
    " " +
    EMC_DATE_NEW.getHours() +
    ":" +
    EMC_DATE_NEW.getMinutes() +
    ":" +
    EMC_DATE_NEW.getSeconds();
  SaveData = {
    ELDER_ID: TempElderUrgentNoti["ID"],
    EMC_DATE: EMC_DATE_TEXT,
    EMC_TYPE: $("#type_urgent").val(),
    EMC_TOPIC: $("#subject_urgent").val(),
    EMC_DESC: $("#detail_urgent").val(),
    EMC_PIC1: imgPreviewArr[0] ? imgPreviewArr[0]["src"] : "",
    EMC_PIC2: imgPreviewArr[1] ? imgPreviewArr[1]["src"] : "",
    EMC_PIC3: imgPreviewArr[2] ? imgPreviewArr[2]["src"] : "",
    EMC_PIC4: imgPreviewArr[3] ? imgPreviewArr[3]["src"] : "",
    EMC_PIC5: imgPreviewArr[4] ? imgPreviewArr[4]["src"] : "",
    CREATE_DATE: EMC_DATE_TEXT,
    UPDATE_DATE: EMC_DATE_TEXT,
    DELETE_FLAG: "0",
  };
  if (SaveData["EMC_TYPE"] == "") {
    alert("กรุณาเลือกประเภทเหตุด่วน");
  } else if (SaveData["EMC_TOPIC"] == "") {
    alert("กรุณากรอกเรื่องที่แจ้ง");
    conf;
  } else {
    showModal("modal-save-confirm-urgent-noti");
  }
});
// ปุ่มยืนยันmodal-save-confirm-urgent-noti
$("#modal-save-confirm-urgent-noti button.submit_save_noti").on(
  "click",
  function () {
    $(".modal-dismiss").click();
    // console.log(SaveData);
    sqlInsert("VHV_TR_EMERGENCY", SaveData, function (res) {
      if (res > 0) {
        let ModelSaveData = {
          token: token.getUserToken(),
          ELDER_ID: SaveData["ELDER_ID"],
          EMC_DATE: SaveData["EMC_DATE"],
          EMC_TYPE: SaveData["EMC_TYPE"],
          EMC_TOPIC: SaveData["EMC_TOPIC"],
          EMC_DESC: SaveData["EMC_DESC"],
          EMC_PIC1: SaveData["EMC_PIC1"],
          EMC_PIC2: SaveData["EMC_PIC2"],
          EMC_PIC3: SaveData["EMC_PIC3"],
          EMC_PIC4: SaveData["EMC_PIC4"],
          EMC_PIC5: SaveData["EMC_PIC5"],
        };
        showModal("modal-save-urgent-noti");
        callAPI(
          `${api_base_url}/saveEmergency`,
          "POST",
          JSON.stringify(ModelSaveData),
          (res) => {
            if (res.status) {
              $(".modal-dismiss").click();
              setTimeout(function () {
                // changePage("home_page", function () {});
                $(".menu_home_page").click();
              }, 500);
            } else {
              alert("ดำเนินการไม่สำเร็จ");
            }
            // console.log(`save success`, res);
            // resolve(res);
          },
          (err) => {
            alert("ดำเนินการไม่สำเร็จ");
            // console.log(`save error`, err);
            // reject(err);
          }
        );

        // setTimeout(function () {
        //   $(".modal-dismiss").click();
        // }, 1000);
        // setTimeout(function () {
        //   changePage("home_page", function () {});
        // }, 1500);
      }
    });
  }
);
// ปุ่มยืนยันmodal-save-confirm-urgent-noti
$("#modal-save-confirm-urgent-noti button.cancel_noti").on(
  "click",
  function () {
    $(".modal-dismiss").click();
  }
);

// เปิด modal กล้อง
$("#urgent_noti_page .DetailElder .camera .open_camera").on(
  "click",
  function () {
    if (
      !$("#urgent_noti_page .DetailElder .camera button.open_camera").hasClass(
        "disabled"
      )
    ) {
      let imgcount = 5 - imgPreviewArr.length;
      $("#modal-camera-urgent-noti .modal_img_title p")
        .eq(1)
        .text("*สามารถเพิ่มได้ " + imgcount + " รูป");
      showModal("modal-camera-urgent-noti");
    }
  }
);

// เปิด modal โทรช่วยเหลือ
$("#urgent_noti_page .DetailElder #telStaffOffice").on("click", function () {
  showModal("modal-tel-urgent-noti");
  telStaffArr = [];
  queryGetSHPHtelStaff(TempElderUrgentNoti["SHPH_ID"], function (res) {
    $.each(res, function (index, row) {
      telStaffArr.push({ TEL_NAME: row.SHPH_NAME, TEL_NO: row.SHPH_TEL });
      queryGetOFFICEtelStaff(
        row.GIS_PROVINCE,
        row.GIS_DISTRICT,
        function (res) {
          $.each(res, function (index, row) {
            telStaffArr.push({
              TEL_NAME: row.OFFICE_NAME,
              TEL_NO: row.OFFICE_TEL,
            });
          });
          renderTelStaff(telStaffArr);
        }
      );
    });
  });
});
// renderTelStaff
function renderTelStaff(telArr) {
  $(
    "#urgent_noti_page #modal-tel-urgent-noti .modal-container #NAME_TEL"
  ).empty();
  let telHTML = "";
  $.each(telArr, function (index, row) {
    telHTML =
      telHTML +
      `<a href="tel:${row.TEL_NO}" class="modal_tel_name">
      <p>${row.TEL_NAME}</p>
      <img src="img/tel_icon.png" TEL_NO="${row.TEL_NO}"/></a>`;
  });
  $(
    "#urgent_noti_page #modal-tel-urgent-noti .modal-container #NAME_TEL"
  ).append(telHTML);
}

// เปิด กล้องถ่ายรูป
$("#urgent_noti_page .on_camera").on("click", function () {
  navigator.camera.getPicture(
    function (res) {
      imgPreviewArr.push({
        id: Math.random(),
        src: "data:image/png;base64," + res,
      });
      if (imgPreviewArr.length >= 5) {
        $("#urgent_noti_page .DetailElder .camera .open_camera").addClass(
          "disabled"
        );
      } else {
        $("#urgent_noti_page .DetailElder .camera .open_camera").removeClass(
          "disabled"
        );
      }
      $(".modal-dismiss").click();
      renderPreviewImg(imgPreviewArr);
    },
    function (err) {},
    {
      destinationType: Camera.DestinationType.DATA_URL,
    }
  );
});

// เลือกกล้องจากเครื่อง
$("#urgent_noti_page .on_gallery").on("click", function () {
  $("#urgent_noti_page #on_gallery").click();
});
$("#urgent_noti_page #on_gallery").change(function () {
  urgentNotireadURL(this);
});
function urgentNotireadURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      imgPreviewArr.push({
        id: Math.random(),
        src: e.target.result,
      });
      if (imgPreviewArr.length >= 5) {
        $("#urgent_noti_page .DetailElder .camera .open_camera").addClass(
          "disabled"
        );
      } else {
        $("#urgent_noti_page .DetailElder .camera .open_camera").removeClass(
          "disabled"
        );
      }
      $(".modal-dismiss").click();
      renderPreviewImg(imgPreviewArr);
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    alert("select a file to see preview");
  }
}
// ลบรูป
function removeImg(imgID) {
  let originalArray = imgPreviewArr;
  filteredArray = originalArray.filter((value) => value.id != imgID);
  imgPreviewArr = filteredArray;
  if (imgPreviewArr.length >= 5) {
    $("#urgent_noti_page .DetailElder .camera .open_camera").addClass(
      "disabled"
    );
  } else {
    $("#urgent_noti_page .DetailElder .camera .open_camera").removeClass(
      "disabled"
    );
  }
  renderPreviewImg(imgPreviewArr);
}
// renderPreviewImg
function renderPreviewImg(imgArr) {
  $("#urgent_noti_page .DetailElder .camera .PreImg").empty();
  let imgPreviewHTML = "";
  $.each(imgArr, function (index, row) {
    imgPreviewHTML =
      imgPreviewHTML +
      `<div class="Img">
      <img src="${row.src}" onclick='showImgFullScreen("${row.src}")'/>
      <div class="dismiss">
        <i class="fa fa-minus" onclick='removeImg("${row.id}")' aria-hidden="true"></i>
      </div>
    </div>`;
  });
  $("#urgent_noti_page .DetailElder .camera .PreImg").append(imgPreviewHTML);
}
// แสดงรูปเต็มหน้าจอ
function showImgFullScreen(src) {
  var modal;
  function removeModal() {
    modal.remove();
    $("body").off("keyup.modal-close");
  }
  modal = $("<div>")
    .css({
      background: "RGBA(0,0,0,1) url(" + src + ") no-repeat center",
      backgroundSize: "contain",
      width: "100%",
      height: "100%",
      position: "fixed",
      zIndex: "10000",
      top: "0",
      left: "0",
      cursor: "zoom-out",
    })
    .click(function () {
      removeModal();
    })
    .appendTo("body");
  //handling ESC
  $("body").on("keyup.modal-close", function (e) {
    if (e.key === "Escape") {
      removeModal();
    }
  });
}
/* ----------------------------------------------------------------------------- start : urgent_noti_page ----------------------------------------------------------------------------- */
// ปุ่ม back
$("#urgent_noti_page .urgent_noti_page_header .back_header_btn").on(
  "click",
  function () {
    changePage("home_page", function () {});
  }
);
// ปุ่ม ปิด tutorial
$("#modal-tutorial-urgent-noti button").on("click", function () {
  toturialvideo.pause();
  $(".modal").hide();
  $("body").removeClass("modal-open");
});

// ปุ่ม แสดงข้อมูล
$("#urgent_noti_page .content .elder .elder_btn").on("click", function () {
  if ($(this).hasClass("show")) {
    $(this).removeClass("show");
    $("#urgent_noti_page .content .elder .elder_btn").text("แสดงข้อมูล");
    $("#urgent_noti_page .content .elder_detail").hide();
  } else {
    $(this).addClass("show");
    $("#urgent_noti_page .content .elder .elder_btn").text("ซ่อน");
    $("#urgent_noti_page .content .elder_detail").show();
  }
});
$(".camera img")
  .eq(0)
  .click(function () {
    var src = $(this).attr("src");
    var modal;

    function removeModal() {
      modal.remove();
      $("body").off("keyup.modal-close");
    }
    modal = $("<div>")
      .css({
        background: "RGBA(0,0,0,1) url(" + src + ") no-repeat center",
        backgroundSize: "contain",
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: "10000",
        top: "0",
        left: "0",
        cursor: "zoom-out",
      })
      .click(function () {
        removeModal();
      })
      .appendTo("body");
    //handling ESC
    $("body").on("keyup.modal-close", function (e) {
      if (e.key === "Escape") {
        removeModal();
      }
    });
  });
// ปุ่ม แสดงรายชื่อผู้สูงอายุทั้งหมด
$("#urgent_noti_page .content .elder_list").on("click", function () {
  changePage("urgent_noti_elder_list_page", function () {
    renderurgent_noti_elder_list_page(ListElderUrgentNoti);
    $("#urgent_noti_elder_list_page .content p").hide();
    $("#urgent_noti_elder_list_page .search_header input").val("");
  });
});

function renderurgent_noti_elder_list_page(elderArr) {
  $("#urgent_noti_elder_list_page .content ul.contact_items").empty();
  let elderViewHTML = "";
  $.each(elderArr, function (index, row) {
    let distanceelderText = "ไม่พบพิกัด";
    if (row.DISTANCE != "N/A") {
      distanceelderText = "ห่างจากคุณ " + row.DISTANCE + " km.";
    }
    elderViewHTML =
      elderViewHTML +
      `<li ELDER_ID="${row.ID}" onclick="selectElder(${row.ID})">
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
  $("#urgent_noti_elder_list_page .content ul.contact_items").append(
    elderViewHTML
  );
}

/* ----------------------------------------------------------------------------- end : urgent_noti_page ----------------------------------------------------------------------------- */
var notiCurrent = [];
var notiLast = [];
/* ----------------------------------------------------------------------------- start : notifications_urgent_noti_page ----------------------------------------------------------------------------- */
function initialNotificationUrgentNotiPageFunc() {
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  notiLast = [];
  notiCurrent = [];
  queryALL("VHV_TR_EMERGENCY", function (res) {
    res.sort((a, b) => (a.ID < b.ID ? 1 : -1));
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var dateText =
      d.getFullYear() +
      "-" +
      (("" + month).length < 2 ? "0" : "") +
      month +
      "-" +
      (("" + day).length < 2 ? "0" : "") +
      day;
    $.each(res, function (index, row) {
      if (row["DELETE_FLAG"] == "0") {
        queryByIDText("VHV_MA_EMCTYPE", row.EMC_TYPE, function (emc_res) {
          let EMC_NAME = emc_res.EMC_NAME;
          if (dateText == row.EMC_DATE.substring(0, 10)) {
            queryByID("VHV_TR_ELDER", row.ELDER_ID, function (res) {
              if (res) {
                notiCurrent.push(
                  mapDataNotifications(res, row, EMC_NAME, "Current")
                );
                renderNotificationsList(notiCurrent, "Current");
              }
            });
          } else {
            queryByID("VHV_TR_ELDER", row.ELDER_ID, function (res) {
              if (res) {
                notiLast.push(mapDataNotifications(res, row, EMC_NAME, "Last"));
                renderNotificationsList(notiLast, "Last");
              }
            });
          }
        });
      }
    });
  });
}
function renderNotificationsList(arr, id) {
  let NotificationsListHTML = "";
  $.each(arr, function (index, row) {
    let answered = "";
    let answeredText = "รอตอบรับ";
    let dateShow = dateStringFormat(row.EMC_DATE);
    if (row.ADMIN_ID != "null" && row.ADMIN_ID != null) {
      answered = " answered";
    }
    if (row.ADMIN_ID != "null" && row.ADMIN_ID != null) {
      answeredText = " ตอบรับแล้ว";
    }

    NotificationsListHTML =
      NotificationsListHTML +
      `<li>
      <div class="notifications-card-body${answered}" onclick='selectElderNotifications(${row.ID},"${row.EMC_FLAG}","${row.EMC_DATE}","${row.EMC_GUID}")'>
        <img class="card-body-thumbnail" src="${row.ELDER_AVATAR}" />
        <div class="card-body-content">
          <h4 class="name">${row.ELDER_NAME}</h4>
          <h5 class="urgent">เหตุด่วน : ${row.EMC_NAME}</h5>
        </div>
        <i class="right-icon fa fa-chevron-right"></i>
      </div>
      <div class="notifications-card-footer${answered}">
        <div class="noti_time">
          <p>
            <i class="fa fa-clock-o" aria-hidden="true"></i>${dateShow}
          </p>
        </div>
        <div class="noti_status${answered}">
          <p style="float: right; padding-left: 30px">${answeredText}</p>
        </div>
      </div>
    </li>`;
  });
  if (id == "Current") {
    $("#notifications_urgent_noti_page .content #Current").empty();
    $("#notifications_urgent_noti_page .content #Current").append(
      NotificationsListHTML
    );
  } else if (id == "Last") {
    $("#notifications_urgent_noti_page .content #Last").empty();
    $("#notifications_urgent_noti_page .content #Last").append(
      NotificationsListHTML
    );
  }
}
function mapDataNotifications(res, row, EMC_NAME, FLAG) {
  res.EMC_FLAG = FLAG;
  res.EMC_DATE = row.EMC_DATE;
  res.EMC_TYPE = row.EMC_TYPE;
  res.EMC_TOPIC = row.EMC_TOPIC;
  res.EMC_DESC = row.EMC_DESC;
  res.EMC_PIC = [];
  row.EMC_PIC1 != "null" ? res.EMC_PIC.push(row.EMC_PIC1) : "";
  row.EMC_PIC2 != "null" ? res.EMC_PIC.push(row.EMC_PIC2) : "";
  row.EMC_PIC3 != "null" ? res.EMC_PIC.push(row.EMC_PIC3) : "";
  row.EMC_PIC4 != "null" ? res.EMC_PIC.push(row.EMC_PIC4) : "";
  row.EMC_PIC5 != "null" ? res.EMC_PIC.push(row.EMC_PIC5) : "";
  res.ADMIN_ID = row.ADMIN_ID;
  res.ADMIN_DATE = row.ADMIN_DATE;
  res.ADMIN_DESC = row.ADMIN_DESC;
  res.ADMIN_SEND = row.ADMIN_SEND;
  if (res.ELDER_LAT != "null" && res.ELDER_LONG != "null") {
    res.DISTANCE = getDistanceFromLatLonInKm(
      CurrentPosUrgentNoti.coords.latitude,
      CurrentPosUrgentNoti.coords.longitude,
      // 16.442611448372272,
      // 102.82001846528836,
      res.ELDER_LAT,
      res.ELDER_LONG
    ).toFixed(1);
  } else {
    res.DISTANCE = "N/A";
  }
  res.CURRENT_LAT = CurrentPosUrgentNoti.coords.latitude;
  res.CURRENT_LONG = CurrentPosUrgentNoti.coords.longitude;
  // res.CURRENT_LAT = 16.442611448372272;
  // res.CURRENT_LONG = 102.82001846528836;
  res.EMC_NAME = EMC_NAME;
  res.EMC_GUID = row.GUID;
  return res;
}
function selectElderNotifications(ID, FLAG, EMC_DATE, EMC_GUID) {
  changePage("urgent_noti_page", function () {
    loading.show();
    initialNotificationDetailUrgentNotiPageFunc(ID, FLAG, EMC_DATE, EMC_GUID);
  });
}
// เปลี่ยนหน้าไป notifications_urgent_noti_page
$("#urgent_noti_page .urgent_noti_page_header .noti_header_btn").on(
  "click",
  function () {
    loading.show();
    callAPI(
      `${api_base_url}/getAllEmergency`,
      "POST",
      JSON.stringify({ token: token.getUserToken() }),
      (res) => {
        if (res.status == true) {
          db.transaction(function (tx) {
            tx.executeSql("DELETE FROM VHV_TR_EMERGENCY ");
          });
          db.transaction(function (tx) {
            $.each(res.data, function (index, row) {
              tx.executeSql(
                "INSERT INTO VHV_TR_EMERGENCY (ID,GUID,VHV_ID,ELDER_ID,EMC_DATE,EMC_TYPE,EMC_TOPIC,EMC_DESC,EMC_PIC1,EMC_PIC2,EMC_PIC3,EMC_PIC4,EMC_PIC5,ADMIN_ID,ADMIN_DATE,ADMIN_DESC,ADMIN_SEND,DELETE_FLAG,CREATE_USER,CREATE_DATE,UPDATE_USER,UPDATE_DATE) VALUES (" +
                  row.ID +
                  ",'" +
                  row.GUID +
                  "','" +
                  row.VHV_ID +
                  "','" +
                  row.ELDER_ID +
                  "','" +
                  row.EMC_DATE +
                  "','" +
                  row.EMC_TYPE +
                  "','" +
                  row.EMC_TOPIC +
                  "','" +
                  row.EMC_DESC +
                  "','null','null','null','null','null','" +
                  row.ADMIN_ID +
                  "','" +
                  row.ADMIN_DATE +
                  "','" +
                  "null','" +
                  row.ADMIN_SEND +
                  "','" +
                  row.DELETE_FLAG +
                  "','" +
                  row.CREATE_USER +
                  "','" +
                  row.CREATE_DATE +
                  "','" +
                  row.UPDATE_USER +
                  "','" +
                  row.UPDATE_DATE +
                  "')",
                [],
                function (tx, results) {
                  // console.log("success", results);
                },
                function (tx, error) {
                  // console.log("unsuccess", error);
                }
              );
            });
          });
          loading.hide();
          changePage("notifications_urgent_noti_page", function () {
            initialNotificationUrgentNotiPageFunc();
          });
        } else {
          loading.hide();
          changePage("notifications_urgent_noti_page", function () {
            initialNotificationUrgentNotiPageFunc();
          });
        }
      },
      (err) => {
        loading.hide();
        changePage("notifications_urgent_noti_page", function () {
          initialNotificationUrgentNotiPageFunc();
        });
      }
    );
  }
);
// ปุ่ม back
$(
  "#notifications_urgent_noti_page .urgent_noti_page_header .back_header_btn"
).on("click", function () {
  changePage("urgent_noti_page", function () {
    initialUrgentNotiPageFunc();
  });
});
/* ----------------------------------------------------------------------------- end : notifications_urgent_noti_page ----------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- start : urgent_noti_elder_list_page ----------------------------------------------------------------------------- */
// ปุ่ม back
$("#urgent_noti_elder_list_page .urgent_noti_page_header .back_header_btn").on(
  "click",
  function () {
    $(".search_header input").removeClass("active");
    $(".search_header input").prop("disabled", true);
    $(".search_header").removeClass("active");
    $("#urgent_noti_elder_list_page .urgent_noti_page_header .title").show();
    changePage("urgent_noti_page", function () {
      initialUrgentNotiPageFunc();
    });
  }
);
// ปุ่ม search
$("#urgent_noti_elder_list_page .urgent_noti_page_header .search_header").on(
  "click",
  function () {
    if ($(".search_header").hasClass("active")) {
      $(".search_header input").removeClass("active");
      $(".search_header input").prop("disabled", true);
      $(".search_header").removeClass("active");
      $("#urgent_noti_elder_list_page .urgent_noti_page_header .title").show();
      $("#urgent_noti_elder_list_page .content p").hide();
    } else {
      $(".search_header input").addClass("active");
      setTimeout(function () {
        $(".search_header input").focus();
        $(".search_header input").select();
      }, 10);

      $(".search_header input").prop("disabled", false);
      $(".search_header").addClass("active");
      $("#urgent_noti_elder_list_page .urgent_noti_page_header .title").hide();
      let searchInput = document.querySelector(
        "#urgent_noti_elder_list_page .search_header input"
      );
      searchInput.addEventListener("input", inputChange);
    }
  }
);
function inputChange(e) {
  var sreachArr = searchFunction(
    ListElderUrgentNoti,
    "ELDER_NAME",
    e.target.value
  );
  renderurgent_noti_elder_list_page(sreachArr);
  if (sreachArr.length > 0) {
    $("#urgent_noti_elder_list_page .content p").show();
    $("#urgent_noti_elder_list_page .content p").text(
      "ตรงกับที่ค้นหา " + sreachArr.length + " รายการ"
    );
  } else {
    $("#urgent_noti_elder_list_page .content p").hide();
  }
}

// select elder
function selectElder(ID) {
  changePage("urgent_noti_page", function () {
    if (markerDestination) {
      markerDestination.setOptions({ visible: false });
    }
    if (infowindowDestination) {
      infowindowDestination.close();
    }
    TempElderUrgentNoti = ListElderUrgentNoti.filter((x) => x.ID == ID)[0];
    $("#urgent_noti_page .notifications-card-body").removeClass("active");
    if (
      TempElderUrgentNoti["ELDER_LAT"] != "null" &&
      TempElderUrgentNoti["ELDER_LONG"]
    ) {
      $("[ELDER_ID=" + TempElderUrgentNoti["ID"] + "]").addClass("active");
      swiper_urgent_noti.slideTo(
        getSlideIndexByELDER_ID(TempElderUrgentNoti["ID"])
      );
      MarkerUrgentNotiPage(
        TempElderUrgentNoti["ELDER_NAME"],
        new google.maps.LatLng(
          TempElderUrgentNoti["ELDER_LAT"],
          TempElderUrgentNoti["ELDER_LONG"]
        )
      );
      enabledElderUrgentNotiPageFunc();
    }
  });
}
function getSlideIndexByELDER_ID(ID) {
  var index = 0;
  $.each(ListElderUrgentNoti, function (i, item) {
    if (item.ID == ID) {
      index = i;
      return false;
    }
  });
  return index;
}
/* ----------------------------------------------------------------------------- start : urgent_noti_elder_list_page ----------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- start : notifications_detail_urgent_noti_page ----------------------------------------------------------------------------- */

function initialNotificationDetailUrgentNotiPageFunc(
  ID,
  FLAG,
  EMC_DATE,
  EMC_GUID
) {
  $(".content").animate(
    {
      scrollTop: $(".content").offset().top,
    },
    0
  );
  $("#urgent_noti_page .urgent_noti_page_header").hide();
  $("#urgent_noti_page .urgent_detail_noti_page_header").show();
  $("#urgent_noti_page .mapContent").removeClass("active");
  $("#urgent_noti_page .notifications-card-body").removeClass("active");
  $("#urgent_noti_page .swiper_elder_content").hide();
  $("#urgent_noti_page .swiper_elder_content_fixed").show();
  $("#urgent_noti_page .DetailElder").hide();
  $("#urgent_noti_page .content .backformap").show();
  $("#urgent_noti_page .content .backformap button").hide();
  $(
    "#urgent_noti_page .content .backformap .backformap_to_notifications_page_btn"
  ).show();
  $("#urgent_noti_page .content .backformap").addClass("to_notifications");
  $("#urgent_noti_page .urgent_noti_page_header .title").hide();
  $("#urgent_noti_page .urgent_noti_page_header .noti_header_btn").hide();
  $("#urgent_noti_page .content .backformap .card-body").eq(0).hide();

  if (FLAG == "Last") {
    TempElderUrgentNoti = notiLast.filter(
      (x) => x.ID == ID && x.EMC_DATE == EMC_DATE
    )[0];
  } else {
    TempElderUrgentNoti = notiCurrent.filter(
      (x) => x.ID == ID && x.EMC_DATE == EMC_DATE
    )[0];
  }

  renderElderCardNotificationDetailUrgentNoti(TempElderUrgentNoti);
  MarkerUrgentNotiPage(
    TempElderUrgentNoti["ELDER_NAME"],
    new google.maps.LatLng(
      TempElderUrgentNoti["ELDER_LAT"],
      TempElderUrgentNoti["ELDER_LONG"]
    )
  );
  $("#urgent_noti_page .UrgentDetailElder").show();
  if (
    TempElderUrgentNoti["ADMIN_ID"] != "null" &&
    TempElderUrgentNoti["ADMIN_ID"] != null
  ) {
    $(
      "#urgent_noti_page .UrgentDetailElder .elder_list_urgent_detail"
    ).addClass("answered");
    $("#urgent_noti_page .UrgentDetailElder .elder_list_urgent_detail p").text(
      "สถานะ : ตอบรับแล้ว"
    );
  } else {
    $(
      "#urgent_noti_page .UrgentDetailElder .elder_list_urgent_detail"
    ).addClass("waiting_answer");
    $("#urgent_noti_page .UrgentDetailElder .elder_list_urgent_detail p").text(
      "สถานะ : รอการตอบรับ"
    );
  }
  let urgentDetailTime = dateStringFormat(TempElderUrgentNoti["EMC_DATE"]);
  $("#urgent_noti_page .UrgentDetailElder #urgentDetailTime").text(
    urgentDetailTime
  );
  $("#urgent_noti_page .UrgentDetailElder #urgentDetailDisease").text(
    "หมายเหตุ: " + TempElderUrgentNoti["EMC_NAME"]
  );
  $("#urgent_noti_page .UrgentDetailElder #urgentDetailDiseaseDetail").text(
    TempElderUrgentNoti["EMC_DESC"]
  );
  if (TempElderUrgentNoti.EMC_PIC.length == 0) {
    callAPI(
      `${api_base_url}/getAllEmergency`,
      "POST",
      JSON.stringify({ token: token.getUserToken(), GUID: EMC_GUID }),
      (res) => {
        if (res.status) {
          // console.log(res.data[0]["EMC_PIC1"]);
          res.data[0]["EMC_PIC1"] != "null"
            ? TempElderUrgentNoti.EMC_PIC.push(res.data[0]["EMC_PIC1"])
            : "";
          res.data[0]["EMC_PIC2"] != "null"
            ? TempElderUrgentNoti.EMC_PIC.push(res.data[0]["EMC_PIC2"])
            : "";
          res.data[0]["EMC_PIC3"] != "null"
            ? TempElderUrgentNoti.EMC_PIC.push(res.data[0]["EMC_PIC3"])
            : "";
          res.data[0]["EMC_PIC4"] != "null"
            ? TempElderUrgentNoti.EMC_PIC.push(res.data[0]["EMC_PIC4"])
            : "";
          res.data[0]["EMC_PIC5"] != "null"
            ? TempElderUrgentNoti.EMC_PIC.push(res.data[0]["EMC_PIC5"])
            : "";
          loading.hide();
          renderElderImgNotificationDetailUrgentNoti(
            TempElderUrgentNoti["EMC_PIC"]
          );
        } else {
          loading.hide();
          renderElderImgNotificationDetailUrgentNoti(
            TempElderUrgentNoti["EMC_PIC"]
          );
        }
      },
      (err) => {
        loading.hide();
        renderElderImgNotificationDetailUrgentNoti(
          TempElderUrgentNoti["EMC_PIC"]
        );
      }
    );
  }
  // renderElderImgNotificationDetailUrgentNoti(TempElderUrgentNoti["EMC_PIC"]);

  $("#urgent_noti_page .UrgentDetailElder #edit_title_text").addClass(
    "edit_title_text"
  );
  $("#urgent_noti_page .UrgentDetailElder #edit_title").addClass(
    "edit_title_disabled"
  );
  $("#urgent_noti_page .UrgentDetailElder #edit_icon").attr(
    "src",
    "img/edit_icon_disabled.png"
  );
  if (directionsRenderer) {
    directionsRenderer.setDirections({ routes: [] });
  }
  if (markerOriginal) {
    markerOriginal.setOptions({ visible: false });
  }
  if (infowindowOriginal) {
    infowindowOriginal.close();
  }
}
function renderElderCardNotificationDetailUrgentNoti(item) {
  let distanceElderCardText = "ไม่พบพิกัด";
  if (item["DISTANCE"] != "N/A") {
    distanceElderCardText = "ห่างจากคุณ " + item["DISTANCE"] + " km.";
  }
  $("#urgent_noti_page .swiper_elder_content_fixed .swiper-slide").empty();
  let ElderCardNotificationDetailHTML = `<div class="notifications-card-body">
      <img class="card-body-thumbnail" src="${item["ELDER_AVATAR"]}" />
      <div class="card-body-content">
        <h4 class="name">${item["ELDER_NAME"]}</h4>
        <div style="display: flex">
          <h5 class="urgent">
            <i class="fa fa-crosshairs" aria-hidden="true"></i>
            ระยะทาง
          </h5>
          <h5
            class="urgent"
            style="color: #6f63fd; padding-left: 5px"
          >${distanceElderCardText}</h5>
        </div>
      </div>
    </div>`;
  $("#urgent_noti_page .swiper_elder_content_fixed .swiper-slide").append(
    ElderCardNotificationDetailHTML
  );
}
function renderElderImgNotificationDetailUrgentNoti(arr) {
  $("#urgent_noti_page .UrgentDetailElder .camera_detail").empty();
  if (arr.length > 0) {
    let ElderImgNotificationDetailHTML = "";
    $.each(arr, function (index, row) {
      if (row.length > 0) {
        ElderImgNotificationDetailHTML =
          ElderImgNotificationDetailHTML +
          `<div class="Img"><img src="${row}" onclick='showImgFullScreen("${row}")'/></div>`;
      }
    });
    $("#urgent_noti_page .UrgentDetailElder .camera_detail").append(
      ElderImgNotificationDetailHTML
    );
  }
}

// ปุ่ม back
$("#urgent_noti_page .urgent_detail_noti_page_header .back_header_btn").on(
  "click",
  function () {
    changePage("notifications_urgent_noti_page", function () {
      initialNotificationUrgentNotiPageFunc();
    });
  }
);
// ปุ่ม กลับหน้าnotifications_detail
$(
  "#urgent_noti_page .content .backformap .backformap_to_notifications_page_btn"
).on("click", function () {
  changePage("notifications_urgent_noti_page", function () {
    initialNotificationUrgentNotiPageFunc();
  });
});
// ปุ่ม backtomapหน้าnotifications_detail
$("#urgent_noti_page .content .backformap .backformap_urgent_detail_btn").on(
  "click",
  function () {
    $("#urgent_noti_page .urgent_noti_page_header").show();
    $("#urgent_noti_page .urgent_detail_noti_page_header").show();
    $("#urgent_noti_page .content").css("top", "60px");
    initialNotificationDetailUrgentNotiPageFunc(
      TempElderUrgentNoti["ID"],
      TempElderUrgentNoti["EMC_FLAG"],
      TempElderUrgentNoti["EMC_DATE"],
      TempElderUrgentNoti["EMC_GUID"]
    );
  }
);
/* ----------------------------------------------------------------------------- end : notifications_detail_urgent_noti_page ----------------------------------------------------------------------------- */
