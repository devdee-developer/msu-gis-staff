$(function () {
  $(".top_menu_wrapper .top_menu_item_wrapper li")
    .eq(0)
    .on("click", function () {
      
      changePage("profile_page", function () {
        initialProfilePageFunc();
      });
     
    });
   
  // ปุ่ม back
  $("#profile_page .profile_page_header .back_header_btn").on(
    "click",
    function () {
      changePage("home_page", function () {});
    }
  );
  // ปุ่ม หน้าที่รับผิดชอบในชุมชน
  $("#profile_page .profile_role").on("click", function () {
    if ($("#profile_page .profile_role").hasClass("active")) {
      $("#profile_page .input_profile_role").hide();
      $("#profile_page .profile_role").removeClass("active");
      $("#profile_page .profile_role img").attr("src", "img/plus_icon.png");
    } else {
      $("#profile_page .input_profile_role").show();
      $("#profile_page .profile_role").addClass("active");
      $("#profile_page .profile_role img").attr("src", "img/dashed_icon.png");
    }
  });
  // ปุ่ม footer back
  $("#profile_page .footer .profile_btn_group .profile_cancel").on(
    "click",
    function () {
      showModal("modal-profile-save-success");
      changePage("home_page", function () {
        $(".modal").hide();
        $("body").removeClass("modal-open");
      });
    }
  );
  // ปุ่ม footer บันทึกข้อมูล
  $("#profile_page .footer .profile_btn_group .profile_submit").on(
    "click",
    function () {
      showModal("modal-profile-save-success");
      setTimeout(function () {
        changePage("home_page", function () {
          $(".modal").hide();
          $("body").removeClass("modal-open");
        });
      }, 1000);
    }
  );
});
function initialProfilePageFunc() {
  topMenu.hide();
  $("#profile_page .input_profile_role").hide();
}
