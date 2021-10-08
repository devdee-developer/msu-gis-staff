$(function () {
  $("#profile_page .profile_page_header .gear_header_btn").on(
    "click",
    function () {
      changePage("setting_page", function () {
        $("#setting_page").addClass("from_profile");
        initialSettingPageFunc();
      });
    }
  );
  $(".top_menu_wrapper .top_menu_item_wrapper li")
    .eq(1)
    .on("click", function () {
      changePage("setting_page", function () {
        initialSettingPageFunc();
      });
    });
  function initialSettingPageFunc() {
    topMenu.hide();
    cordova.getAppVersion.getVersionNumber().then(function (version) {
      $('.version').text(version);
  });
    // $("#profile_page .input_profile_role").hide();
  }
  // ปุ่ม back
  $("#setting_page .setting_page_header .back_header_btn").on(
    "click",
    function () {
      if ($("#setting_page").hasClass("from_profile")) {
        changePage("profile_page", function () {});
        initialProfilePageFunc();
      } else {
        changePage("home_page", function () {});
      }
    }
  );
  // ปุ่มเปลี่ยนรหัส
  $("#setting_page #change_pass").on("click", function () {
    // showModal("modal-change-pass");
    showModal("modal-in-progress");
  });
  // ปุ่มคู่มือ
  $("#setting_page #manual_setting").on("click", function () {
    showModal("modal-in-progress");
  });
  // ปุ่มคู่อัพเดท
  $("#setting_page #update_setting").on("click", function () {
    var platform  = device.platform;
    if(platform == 'Android'){
      window.open("https://play.google.com/store/apps/details?id=com.meedeem.vhvapp");
    }else{
      showModal("modal-in-progress");
    }
   
  });
  // ปิด modal-change-pass
  $("#modal-change-pass .setting_cancel").on("click", function () {
    $(".modal").hide();
    $("body").removeClass("modal-open");
  });
  // ปุ่มบันทึก modal-change-pass
  $("#modal-change-pass .setting_submit").on("click", function () {
    $(".modal").hide();
    $("body").removeClass("modal-open");
    showModal("modal-profile-save-success");
    setTimeout(function () {
      $(".modal").hide();
      $("body").removeClass("modal-open");
    }, 1000);
  });
});
