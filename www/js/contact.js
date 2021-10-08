$(function () {
  $(".menu_contact_page").on("click", function () {
    initialContactPage()
    changePage("contact_page", function () {
      loading.show();
      setTimeout(function () {
        loading.hide();
      }, 500);
    });
  });
  $("#contact_page .header .back_header_btn").on("click", function () {
    changePage('home_page', function () {
    });
  });
  $("#contact_page .collapse-filter .collapse-filter-header").click(function () {
    $header = $(this);
    $content = $header.next();
    $(".toggle", this).toggleClass("fa-chevron-up fa-chevron-down");
    $content.slideToggle(200, function () {});
  });
  $("#contact_page .btn-sort").on("click", function () {
    showModal("modal-sort-contact");
  });
  $("#contact_page .contact_items").on("click", "li", function () {
    queryByID("VHV_TR_ELDER", $(this).attr("ELDER_ID"), function (res) {
      renderElderModal(res, "modal-contact-detail", true, true);
    });
  });
  function renderElderListContact(_callback) {
    queryALL("VHV_TR_ELDER", function (elderList) {
      console.log(elderList);
      $("#contact_page .contact_items").html("");
      $("#contact_page .sort-bar h4 span").html(`${elderList.length} คน`);
      $.each(elderList, function (index, row) {
        $("#contact_page .contact_items").append(renderElderCard(row));
      });
      loading.hide();
      _callback(elderList);
    });
  }
  function initialContactPage() {
    renderElderListContact(function (elderList) {
      queryALL("VHV_MA_GIS_PROVINCE", function (res) {
        if(res){
          $("#contact_page .content .collapse-filter #visitSearchProvince").val(
            "จังหวัด " + res[0]["GIS_PROVINCENAME"]
          );
        }else{
          $("#contact_page .content .collapse-filter #visitSearchProvince").val(
            "จังหวัด "
          );
        }
        
      });
      queryALL("VHV_MA_GIS_TUMBOL", function (res) {
        if(res){
          $("#contact_page .content .collapse-filter #visitSearchTumbol").val(
            "ตำบล " + res[0]["GIS_TUMBOLNAME"]
          );
        }else{
          $("#contact_page .content .collapse-filter #visitSearchTumbol").val(
            "ตำบล "
          );
        }
       
      });
      queryALL("VHV_MA_SHPH_MOO", function (res) {
        if(res){
          $("#contact_page .content .collapse-filter #visitSearchMoo").val(
            "หมู่ที่ " + res[0]["SHPH_MOO"]
          );
        }else{
          $("#contact_page .content .collapse-filter #visitSearchMoo").val(
            "หมู่ที่ "
          );
        }
        
      });
    });
  }
});
