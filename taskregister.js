
function usermsgfun(msg){
    document.getElementById("divusermsg").style.visibility = "visible";
    document.getElementById("usermsg12").innerHTML = msg;
    setTimeout(function(){
    document.getElementById("divusermsg").style.visibility = "hidden";
    }, 2000);
}
function updateDateTime() {
    var currentDate = new Date();
    var formattedDate = currentDate.toISOString().split('T')[0];
    var formattedTime = currentDate.toTimeString().split(' ')[0];
    var dateTimeString = formattedDate + '   ' + formattedTime;
    document.getElementById('liveDateTime').value = dateTimeString;
}
setInterval(updateDateTime, 1000);
updateDateTime();
function closemainpage1(){
    clearInterface();
    document.getElementById("taskregistermainpage").style.display= "none";
    document.getElementById("taskpage").style.display= "none";
    document.getElementById("mainmenu").style.display= "block";
    document.getElementById("showchat").style.display= "none";
    document.getElementById("staffdialogs").style.display= "none";
    document.getElementById("aadtaskdialogbox").style.display='none';
    document.getElementById("dialogbox").style.display='none';
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("fileadd").style.display="none";
}

function subscribe(){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'subscribe',
            moduleid: '19',
        },
        //contentType: "text/plain; charset=utf-8",
        cache: false,
        success: function subscribe(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
                if (res === "Saved") {
                    alert("Your trial period of 3 days is started.")
                    window.location.replace('/1/menu')
                }
                else if(res==="used"){
                    alert("Please buy subscription of 1 year, You already used your trial period")
                }
            }
        }
    })
}
function sendmessage1(){
    let rtext = "https://wa.me/91" + 8009936009;
    window.open(rtext, 'xyz');
}
function sendmessage2(){
    let rtext = "https://wa.me/91" + 8009926009
    window.open(rtext, 'xyz');
}
function orginfo(){
    document.getElementById("orgnibtn").style.display= "none";
    document.getElementById("org").style.display= "block";
    document.getElementById("taskpage").style.display="none";
}
function cancelbutton(){
    document.getElementById("orgnibtn").style.display= "none";
    document.getElementById("org").style.display= "block";
}
function saveorginfo(){
if($("#nameorg").val()===''){
    return alert("Enter the oraganiztion name")
}
if($("#orgaddress").val()===''){
    return alert("Enter the address name")
}
if($("#orgcity").val()===''){
    return alert("Enter the city name")
}
if($("#orgstate").val()===''){
    return alert("Enter the state name")
}
if($("#orgemail").val()===''){
    return alert("Enter the email name")
}
if($("#phoneno").val()===''){
    return alert("Enter the mobile number ")
}
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'saveorginfo',
            nameorg:  $("#orgname").val(),
            phoneno: $("#phoneno").val(),
            orgaddress:  $("#orgaddress").val(),
            orgaddress2:  $("#orgaddress2").val(),
            orgcity:  $("#orgcity").val(),
            orgstate:  $("#orgstate").val(),
            orgemail:  $("#orgemail").val(),
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            usermsgfun(res);
            cancelorgdb();
            window.location.replace('/1/menu')
            }
        }
        
    })
}

function taskpage(){
    var today = new Date();
   today = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2)
   document.getElementById("mainmenu").style.display="none"
   document.getElementById("page").value=today 
}
 function taskregisterpage(){
     retriveprojectname(); 
     retrivetaskstatus();
     retrivetaskstatus1();
    document.getElementById("taskpage").style.display="block";
    document.getElementById("taskregistermainpage").style.display="block";
    document.getElementById("mainmenu").style.display="none";
    document.getElementById("kb").style.display="none";
    document.getElementById("kb4").style.display="none";
    document.getElementById("kb1").style.display="none";
    document.getElementById("kb2").style.display="none";
    document.getElementById("kb3").style.display="none";
    
}
function cancelorgdb(){
    document.getElementById("mainmenu").style.display="block";
    document.getElementById("org").style.display="none";
    window.location.replace('/1/menu')
}
 function updateorginfo(){
    retrivebgstylecolor();
    document.getElementById("updateorgnization").style.display="block";
    document.getElementById("mainmenu").style.display="none";
     retriveorginfo();
     gettaskregister();
}
function cancelbutton1(){
    document.getElementById("updateorgnization").style.display="none";
    document.getElementById("mainmenu").style.display="block";
}
 function kanbanboard(){
    clearInterface();
    showkanbanboard();
    showprojectnameval();
    document.getElementById("showkanbanboarddata").style.display="block";
    document.getElementById("showprojectdata").style.display="none";
    document.getElementById("hideinf").style.display="block";
    document.getElementById("showchat").style.display="none";
     document.getElementById("desshowinformation").style.display="block";
     document.getElementById("logshowinfo").style.display="block";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("fileadd").style.display="none";
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
    document.getElementById("myButton").style.display="block"; 
}
function chatboard(){
    clearInterface();
    document.getElementById("myButton").style.display="none";
    document.getElementById("showprojectdata").style.display="none";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("showchat").style.display="block";
    document.getElementById("desshowinformation").style.display="none";
    document.getElementById("logshowinfo").style.display="none";
    document.getElementById("hideinf").style.display="none";
    showprojectnameval1();
    groupnamelist1();
    if(projectid=='Project Name'){
        document.getElementById("showchat").style.display="none";
        return
    } 
}
function showupinde(){
    document.getElementById("kb").style.display="block";
    document.getElementById("kb1").style.display="block";
    document.getElementById("kb2").style.display="block";
    document.getElementById("kb3").style.display="block";
    document.getElementById("kb4").style.display="block";
    document.getElementById("myButton").style.display="block";
}
function retriveorginfo(){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'retriveorginfo',
        },
        cache: false,
        success: function user(res) {
            //alert (res);
            document.getElementById("orgname1").value=res[0];
            document.getElementById("phoneno1").value=res[1];
            document.getElementById("uaddress").value=res[2];
            document.getElementById("uaddress2").value=res[3];
            document.getElementById("ucity").value=res[4];
            document.getElementById("ustate").value=res[5];
            document.getElementById("uemail").value=res[6];
        }
    })
}
function updateorg(){
    if($("#orgname1").val()===''){
        return alert("Enter the oraganiztion name")
    }
    if($("#uaddress").val()===''){
        return alert("Enter the address name")
    }
    if($("#ustate").val()===''){
        return alert("Enter the state name")
    }
    if($("#ucity").val()===''){
        return alert("Enter the city name")
    }
    if($("#uemail").val()===''){
        return alert("Enter the email name")
    }
    if($("#phoneno1").val()===''){
        return alert("Enter the mobile name")
    }
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'updateorg',
            nameorg:  $("#orgname1").val(),
            phoneno: $("#phoneno1").val(),
            uaddress: $("#uaddress").val(),
            uaddress2: $("#uaddress2").val(),
            ucity: $("#ucity").val(),
            ustate: $("#ustate").val(),
            uemail: $("#uemail").val()
        },
        cache: false,
        success: function user(res) {
            usermsgfun(res);
        }

    })
}
//css color
function retrivebgstylecolor(){
    $.ajax({
        url:"/1/taskregister",
        type: 'POST',
        data: {
            action: 'retrivebgstylecolortr',
        },
        cache: false,
        success: function savecaller(res) {
        //    alert(res)
            var slsn1 = document.getElementById("csscolor")
            if(slsn1!=null){
                slsn1.length = 0
                slsn1[slsn1.length] = new Option('Color Name')
                for (i = 0; i < res.length; i++) {
                    var myOption = document.createElement("option");
                    try{
                        var x=JSON.parse(res[i]);
                        myOption.text = x.name;
                        myOption.value = x.filename;
                        slsn1.add(myOption);
                    }catch(err)
                    {   
                    }
                }
            }      
        }
    })
} 
function orgcolortaskregister(){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'orgcolortaskregister',
            csscolor:  $("#csscolor").val(),
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            usermsgfun("updated successfully");
            window.location.replace("/1/menu");
            }
        }

    })

}
// function retrivorgcolortr(){
//     $.ajax({
//         url: "/1/taskregister",
//         type: 'POST',
//         data: {
//             action: 'retrivorgcolortr' ,
//         },
//         cache: false,
//         success: function user(res) {
//             if(res == 'error' || res =='No Image'){
//             }else{
//                 applyorgcolor(res);
//                 // alert(res)
//             }
//         }
//     })  
// }

  
function newprojectinfo(){
    clearInterface();
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("fileadd").style.display="none";
    document.getElementById("dialogbox").style.display="block";
    document.getElementById("favdialog").style.display = "block";
    document.getElementById("chatgroupdiv").style.display="none";
}
function closedialogbox() {
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("favdialog").style.display="none"
    
}
function savedialogbox(){
    clearInterface();
    if($("#projectname").val()===''){
        return alert("Enter the project name")
    }
    if ($("#projectdescriptioninfo").val().trim() === "") {
        return alert("Enter the description ")
       }
    //document.getElementById("loader2").style.visibility='visible'
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'savedialogbox',
            projectname:$("#projectname").val(),
            projectdescription: $("#projectdescriptioninfo").val()
        },
        cache: false,
        success: function user(res) {
       // document.getElementById("loader2").style.visibility='hidden'
        if(res === 'sessionexpired'){
            alert("Session Expired, Please login Again")
            window.location.replace("/1/login")
        }else{
            if(res==='data insert'){
                usermsgfun("New Project Insert")
                retriveprojectname();
                closedialogbox();
                projectname.value='';
                projectdescriptioninfo.value='';
            }else{
                retriveprojectname();
                closedialogbox();
                projectname.value='';
                projectdescriptioninfo.value='';
                usermsgfun(res)
            }
        }
        }  
    })    
}
function retriveprojectname(){
    $.ajax({
        url:"/1/taskregister",
        type: 'POST',
        data: {
            action: 'retriveprojectname',
        },
        cache: false,
        success: function savecaller(res) {
           // alert(res)
            var slsn1 = document.getElementById("showprojectname")
            if(slsn1!=null){
                slsn1.length = 0
                slsn1[slsn1.length] = new Option('Project Name')
                for (i = 0; i < res.length; i++) {
                    var myOption = document.createElement("option");
                    try{
                        var x=JSON.parse(res[i]);
                        myOption.text = x.projectname;
                        myOption.value = x.projectid;
                        slsn1.add(myOption);
                    }catch(err)
                    {   
                    }
                }
            }      
        }
    })
}
function addtaskbutton(){
    clearInterface();
    projectid = $("#showprojectname").val();
    if(projectid=='Project Name'){
        usermsgfun("Please Select Project Name ")
        return
    }
    document.getElementById("aadtaskdialogbox").style.display="block";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("adddtask").style.display="block";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("fileadd").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
}
function closeaddtask(){
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("adddtask").style.display="none";
}
function saveaddtask(){
    projectid = $("#showprojectname").val();
    if($("#addtaskname").val()===''){
        return alert("Enter the project name")
    }
   if ($("#addtaskdescription").val().trim() === "") {
    return alert("Enter the description ")
   }
    if($("#startdate").val()===''){
        return alert("Enter the startdate")
    }
    if($("#enddate").val()===''){
        return alert("Enter the enddate")
    }
    if($("#addtaskstatus").val()===''){
        return alert("Enter the addtaskstatus")
    }
    var ans = confirm("Ones Can Save Date Can Not Be Change")
            if(ans==true){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'saveaddtask',
            addtaskname:  $("#addtaskname").val(),
            addtaskdescription: $("#addtaskdescription").val(),
            startdate:  $("#startdate").val(),
            enddate:  $("#enddate").val(),
            addtaskstatus:  $("#addtaskstatus").val(),
            projectid: projectid
            
        },
        cache: false,
        success: function user(res) {
        //document.getElementById("loader2").style.visibility='hidden'
        if (res === 'sessionexpired') {
            alert("Session Expired, Please login Again");
            window.location.replace("/1/login");
        } else {
            if (res === 'Data inserted') {
                usermsgfun("New Task Inserted")
                    addtaskname.value = '';
                    addtaskdescription.value = '';
                    startdate.value = '';
                    enddate.value = '';
                    addtaskstatus.value = '';
                    closeaddtask();
                    allshowinfo();
            } else {
                addtaskname.value = '';
                    addtaskdescription.value = '';
                    startdate.value = '';
                    enddate.value = '';
                    addtaskstatus.value = '';
                    closeaddtask();
                    allshowinfo();
                usermsgfun(res);
            }
        }
        } 
    });
}
}
            // *** Showproject And  Kanbanbord
function showproject(){
    clearInterface();
    projectid = $("#showprojectname").val();
//    alert(projectid)
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'showproject',
            projectid:projectid
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
                    retrivetaskstatus1();
                    document.getElementById("showprojectdata").innerHTML=res   
            }  
        }
    })
}
function showkanbanboard(){
    clearInterface();
    projectid = $("#showprojectname").val();
    if(projectid=='Project Name'){
        usermsgfun("Please Select Project Name ")
       return
   }
   $.ajax({
       url: "/1/taskregister",
       type: 'POST',
       data: {
           action: 'showkanbanboard',
            projectid:projectid,
            
       },
       cache: false,
       success: function user(res) {
           if(res === 'sessionexpired'){
               alert("Session Expired, Please login Again")
               window.location.replace("/1/login")
           }else{
               if(res != 'No Task') {
                  
                   document.getElementById("showkanbanboarddata").innerHTML=res
               }else{
                   document.getElementById("showkanbanboarddata").innerHTML=res  
                   retrivetaskstatus1(); 
               } 
           }   
       }
   })

}
function selectchatttask(taskid){
    alert(taskid)
}

function taskregistermainpageclose(){
    document.getElementById("taskpage").style.display="none";
    document.getElementById("mainmenu").style.display="block";
    closemainpage();
}
function closemainpage(){
    document.getElementById("desshowinformation").style.display="none";
    document.getElementById("logshowinformation").style.display="none";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("showprojectdata").style.display="none";  
}
function infoupdateclosebtn(){
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("updatefavdialog").style.display="none";
}

// *** Insert , Update ,Add Log , Upload File ////
function updatetaskin(){
    clearInterface();
    var hiddenbox1 = document.getElementById('taskidk');
    var taskid = hiddenbox1.value;
    retriveupdatetask(taskid);
    retrivorgstatus(taskid);
    document.getElementById("updateinfodig").style.display="block";
    document.getElementById("updatefavdialog").style.display="block";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("fileadd").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
}
function updateinfo() {
    var hiddenbox1 = document.getElementById('taskidk');
    var taskid = hiddenbox1.value;
    var projectid = $("#showprojectname").val();
    var selected = document.querySelector("input[name='statusGroup']:checked");
    if (!selected) {
        return alert("Please select a status");
    }
    var selectedStatus = selected.value;
    if (!selectedStatus || selectedStatus === 'statusGroup') {
        return alert("Please select a valid status");
    }
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'updateinfo',
            addtaskname: $("#addtaskname1").val(),
            addtaskdescription: $("#addtaskdescription1").val(),
            taskstatus: $("#retrivstatus").val(),
            status: selectedStatus,
            projectid: projectid,
            taskid: taskid
        },
        cache: false,
        success: function user(res) {
            if (res === 'sessionexpired') {
                alert("Session Expired, Please login Again");
                window.location.replace("/1/login");
            } else {
                if (res === 'updated'){
                    showproject();
                    showlog();
                    showorglog();
                    showdescription1(taskid);
                    usermsgfun("task Update Successfully")
                    infoupdateclosebtn();
                document.getElementById("updateinformation").innerHTML=res;
                } else {
                    showproject();
                    showlog();
                    showorglog();
                    showdescription1(taskid);
                    usermsgfun(res);
                    infoupdateclosebtn();
                }
            }
            // Your existing success callback...
        }
    });
}
function allshowinfo(taskid){
    showprojandkan(taskid);
    showloganddescription(taskid);
}

 function showprojandkan(){
    showproject(); 
    showkanbanboard(); 
}
function retrivorgstatus(taskid){
    var hiddenbox1 = document.getElementById('taskidk');
        hiddenbox1.value = taskid;
        //alert(taskid)
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'retrivorgstatus',
                 taskid:taskid
            },
            cache: false,
            success: function user(res) {
                //alert(res)
                var orgstatus = res[0];
                $("input[name='statusGroup']").removeAttr('checked');
                $("input[name='statusGroup'][value='" + orgstatus + "']").prop('checked', true);
            }
        })

}
function retriveupdatetask(taskid){
     //alert(taskid +"  taskid retriv")
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'retriveupdatetask',
             projectid:projectid,
             taskid:taskid
        },
        cache: false,
        success: function user(res) {
            //   alert (res);
            document.getElementById("addtaskname1").value=res[0];
            document.getElementById("addtaskdescription1").value=res[1];
            document.getElementById("retrivstatus").value=res[2];
            
        }
    })
}
function updatelogadd(){
    //alert("hello")
    var hiddenbox1 = document.getElementById('taskidk');
     taskid = hiddenbox1.value 
     //alert(taskid +"update log 1")
   $.ajax({
       url: "/1/taskregister",
       type: 'POST',
       data: {
           action: 'updatelogadd',
            taskid:taskid, 
       },
       cache: false,
       success: function user(res) {
        if(res === 'sessionexpired'){
            alert("Session Expired, Please login Again")
            window.location.replace("/1/login")
        }else{
        //alert(res)
        allshowinfo();
        }   
       }
   })
}

 function openprojectinfo(){
    clearInterface();
    document.getElementById("showprojectdata").style.display="block";
    document.getElementById("hideinf").style.display="block";
    document.getElementById("desshowinformation").style.display="block";
  document.getElementById("logshowinfo").style.display="block";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("showchat").style.display="none";
    document.getElementById("myButton").style.display="block";
    projectid = $("#showprojectname").val();
    if(projectid=='Project Name'){
        usermsgfun("Please Select Project Name ")
        return
    }
     showproject();
     showprojectnameval();
}
    function insertaskinfo(){
        clearInterface();
        var hiddenbox1 = document.getElementById('taskidk');
        var taskid = hiddenbox1.value;
      // alert(taskid + "insert sub task");
       document.getElementById("insertinfo").style.display="block";
        document.getElementById("insertfavdialog").style.display="block";
        document.getElementById("showkanbanboarddata").style.display="none";
        document.getElementById("aadtaskdialogbox").style.display="none";

        document.getElementById("updateinfodig").style.display="none";
        document.getElementById("insertloginfo").style.display="none";
        document.getElementById("staffdialog").style.display="none";
        document.getElementById("dialogbox").style.display="none";
        document.getElementById("fileadd").style.display="none";
        document.getElementById("chatgroupdiv").style.display="none";
    }
    function setTaskId(taskid) {
        var hiddenbox1 = document.getElementById('taskidk');
        hiddenbox1.value = taskid;
      
    }
function infoinsertclosebtn(){
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("insertfavdialog").style.display="none";
}
function saveaddtaski(){
    projectid = $("#showprojectname").val();
    //  alert(projectid +"projectid")
     var hiddenbox1 = document.getElementById('taskidk');
     taskid = hiddenbox1.value 
     //alert(taskid +"inserted")
     if ($("#addtaskdescriptioni").val().trim() === "") {
        return alert("Enter the description ")
       }
       var ans = confirm("Ones Can Save Date Can Not Be Change")
        if(ans==true){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'saveaddtaski',
            addtaskname:  $("#addtasknamei").val(),
            addtaskdescription: $("#addtaskdescriptioni").val(),
            startdate:  $("#startdatei").val(),
            enddate:  $("#enddatei").val(),
            addtaskstatus:  $("#addtaskstatusi").val(),
            parenttaskid: taskid,
            projectid:projectid,
            taskid: taskid
       },
        cache: false,
        success: function user(res) {
        if (res === 'sessionexpired') {
            alert("Session Expired, Please login Again");
            window.location.replace("/1/login");
        } else {
            if (res === 'Data inserted') {
                usermsgfun("Sub Task save successfully ");
                showproject();
                //savetaskshow();
                allshowinfo();
                infoinsertclosebtn();
                addtasknamei.value = '';
                addtaskdescriptioni.value = '';
                startdatei.value = '';
                enddatei.value = '';
                addtaskstatusi.value = '';
            } else {
                usermsgfun(res);
            }
           }
        } 
    });
}
}

function addloginfo1(){
    clearInterface();
    var hiddenbox1 = document.getElementById('taskidk');
     taskid = hiddenbox1.value 
     //alert(taskid +"add log" )
    document.getElementById("insertloginfo").style.display = "block";
    document.getElementById("adddlog").style.display = "block";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("fileadd").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
}
function addlogclosebtn(){
    document.getElementById("insertloginfo").style.display="none";
    document.getElementById("adddlog").style.display="none";
}
function saveloginfo(){
     var hiddenbox1 = document.getElementById('taskidk');
     taskid = hiddenbox1.value 
      //alert(taskid +"taskid")
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'saveloginfo',
            addlogtext: $("#addlogtext").val(),
            taskid: taskid
       },
        cache: false,
        success: function user(res) {
            // alert (res);
        //document.getElementById("loader2").style.visibility='hidden'
        if (res === 'sessionexpired') {
            alert("Session Expired, Please login Again");
            window.location.replace("/1/login");
        } else {
            if (res === 'data insert') {
                usermsgfun("Log Info Save Successfully");
                showlog(taskid);
                addlogclosebtn();
            addlogtext.value = '';
            } else {
                usermsgfun(res);
            }
           }
            }
    });
}
function savetaskshow(){
    var hiddenbox = document.getElementById('taskid');
     taskid = hiddenbox.value 
    //   alert(taskid +"taskid ......")
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'savetaskshow',
            taskid:taskid
        },
        cache: false,
        success: function
         user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            showloganddescription();
            }
        }
    })
}
function showorglog(taskid){
    var hiddenbox1 = document.getElementById('taskidk');
    taskid = hiddenbox1.value 
    //alert(taskid +"taskid ......")
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'showorglog',
            taskid:taskid
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
                document.getElementById("logshowinformation").innerHTML=res
            }     
        }
    })
}

function showlog(taskid){
    //alert(taskid + "  before")
    // var hiddenbox1 = document.getElementById('taskidk');
    // taskid = hiddenbox1.value 
    // alert(taskid +"taskid ......")
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'showlog',
            taskid:taskid
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
                //alert(res)
                document.getElementById("logshowinformation").innerHTML=res
            }     
        }
    })
}
function showdescription(showdescription){
    var hiddenbox = document.getElementById('taskid');
     taskid = hiddenbox.value 
     taskid = showdescription;
     //alert("descr " +taskid)
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'showdescription',
            taskid:taskid,
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            //  alert (res);
            document.getElementById("desshowinformation").innerHTML=res
            // alert("......")
            }  
        }
    })
}

function showdescription1(taskid){
    //alert("   ....." + taskid)
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'showdescription',
            taskid:taskid,
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            // alert("under success")
            //  alert (res);
            document.getElementById("desshowinformation").innerHTML=res
            // alert("......")
            } 
        }
    })
}
function logoupload1(){
    var filename;
    var uploadimg = document.getElementById("uploadlogo1");
    var uploaddata=uploadimg.value;
    if(!uploadimg.files[0]){
        return alert("Please select file first");
    }
    //alert(uploaddata);
    var size = uploadimg.files[0].size / 1024 /1024;  
    //alert(size);
   
    //alert(size);
    var fileext = uploaddata.split(".").pop();
    //if(fileext != 'jpg' || fileext != 'png' || fileext != 'jpeg' ){
    if(fileext !== 'jpg' && fileext !== 'png' && fileext !== 'jpeg' ){
        return alert("please select 'jpg' image extention")
    }
    if(size > 1){
        return alert("please select file less than 1 mb");
    }
    //var conf;
    //var conf = confirm("Do You Want TO Upload This Image For Logo !!!! ");
    //alert(conf)
    //if(conf === true){
        var filestore = uploadimg.files[0];
        var formdata = new FormData();
        formdata.append('image',filestore);
        formdata.append('action','savefile');
        fetch('/1/fileoperations',{method: "POST", body: formdata}).then(response=>response.text()).then(data=>{
            $.ajax({
                url: "/1/taskregister",
                type: 'POST',
                data: {
                    action: 'savefileidservice',
                    uploaddata:uploaddata
                },
                cache: false,
                success: function savecaller(res) {
                    if(res === 'sessionexpired'){
                        alert("Session Expired, Please login Again")
                        window.location.replace("/1/login")
                    }else{
                        if(res =='error'){
                            usermsgfun("Error while uploading image try again later")
                        }else{
                            getlogoimageservice();
                            usermsgfun("Logo uploded Successfully")
                        } 
                    }
                    }
            })
        })
        // window.location.replace("/1/servicemodule");
   // }
}
function getlogoimageservice(){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'getlogoimageservice' 
        },
        cache: false,
        success: function user(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
                if(res == 'error' || res =='No Image'){
                }else{
                    document.getElementById("logupload").innerHTML="<img src='/gettaskreg/"+res+"' style='margin-left:2%; height:100px;'>"
                }
            }
        }
    })
}
      //for single retriveimage  (for logo )
function gettaskregister(){
    //  alert("logo")
    $.ajax({ 
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'retrivlogo'
        },
        cache: false,
        success:function successfun(res) {
            if(res === 'sessionexpired'){
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            }else{
            //  alert(res +"  get logo")
                if(res == 'error' || res =='No' || res == ''){
                    //  alert("Not Found")
                }else{
                    document.getElementById("logupload").innerHTML="<img src='/getpictureslogo/"+res+"'>"         
                    //  alert("img")
                }
            }
        }
    })
}

function addfileinfo(){
    clearInterface();
    var hiddenbox1 = document.getElementById('taskidk');
     taskid = hiddenbox1.value 
     //alert(taskid +"fileinfo" )
    document.getElementById("fileadd").style.display = "block";
    document.getElementById("favdialogfile").style.display = "block";
    document.getElementById("insertloginfo").style.display = "none";
    document.getElementById("updateinfodig").style.display="none";
    document.getElementById("showkanbanboarddata").style.display="none";
    document.getElementById("staffdialog").style.display="none";
    document.getElementById("aadtaskdialogbox").style.display="none";
    document.getElementById("insertinfo").style.display="none";
    document.getElementById("dialogbox").style.display="none";
    document.getElementById("chatgroupdiv").style.display="none";
   
}
function closedialogboxfile(){
    document.getElementById("fileadd").style.display="none";
    document.getElementById("favdialogfile").style.display="none";
}
async function calllog(taskid){
    //console.log("taskid in calllog " +taskid)
         showdescription1(taskid);
         showlog(taskid);
         showupinde();
         clearInterface();

}
 function showloganddescription(){
     showdescription1(taskid);
     showlog(taskid);
}

function showprojectnameval(){
    var data = $("#showprojectname option:selected").text();
    document.getElementById("selectedProject").innerHTML=data;
}
function showprojectnameval1(){
    var data = $("#showprojectname option:selected").text();
    document.getElementById("selectedProject1").innerHTML=data;
}
function filesave1() {
    var hiddenbox1 = document.getElementById('taskidk');
    var taskid = hiddenbox1.value;

    var uploadrec = document.getElementById("uploadfile2");
    if (!uploadrec.files[0]) {
        return alert("Please select file first");
    }

    var size = uploadrec.files[0].size / 1024 / 1024;
    var fileext = uploadrec.value.split(".").pop();
    //alert(size + "23")
    if (fileext != 'png' && fileext != 'jpg' && fileext != 'jpeg' && fileext != 'pdf' && fileext != 'mp3' && fileext != 'mp4') {
        return alert("please select 'png' , 'jpg' , 'jpeg' , 'pdf' extention")
    } else if (size > 1) {
        return alert("please select file less than 1 mb");
    }
    var conf = confirm("Do You Want TO Upload This File!!!! ");

    if (conf === true) {
        var filestore = uploadrec.files[0];
        var formdata = new FormData();
        formdata.append('image', filestore);
        formdata.append('action', 'savefile');

        fetch('/1/fileoperations', { method: "POST", body: formdata }).then(response => response.text()).then(data => {
            $.ajax({
                url: "/1/taskregister",
                type: 'POST',
                data: {
                    action: 'uploadprofile1',
                    taskid: taskid,
                    size:size,
                    filename: uploadrec.value.split('\\').pop().split('/').pop()
                },
                cache: false,
                success: function savecaller(res) {
                    if (res == 'error') {
                        usermsgfun("Error while uploading image try again later")
                    } else {
                        showlog(taskid);
                        uploadrec.value = '';
                        usermsgfun(res)
                        closedialogboxfile();
                    }
                }
            })
        })
    }
}

    function dfile(fileId){
        // alert("hey" + fileId)
        var hiddenbox1 = document.getElementById('taskidk');
        var taskid = hiddenbox1.value;
        // alert(taskid  +"...file1")
        //alert(fileId +"'''''''''''''")
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'downloadfile1',
                taskid:taskid,
                data:fileId
            },
            cache: false,
            success: function(res){  
                // alert(res)
                if(res == 'error' || res =='No Image'){
                    usermsgfun("Document Did Not Exist.")
                }else{
                    //alert(res) 
                    var encodedUri = encodeURI('/gettaskregister/'+res+'');
                    //alert(encodedUri)
                    //alert("hello")
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", res);
                    document.body.appendChild(link);
                    link.click(); 
                     
               }
            }
        })
        } 
                              // *** Manage Staff  //
        function showstaffreport(){
        projectid = $("#showprojectname").val();
        //  alert(projectid  +"   projectid")
        // alert("hello")
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'showstaffreport', 
                projectid:projectid
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res != 'No Record') {
                        
                        document.getElementById("staffreport1").innerHTML=res;   
                        
                    }else{
                        document.getElementById("staffreport1").innerHTML=res;   
                    } 
                }  
                    //alert(res);
                    
                    
            }
        })
    }
    function addstaff(){
        clearInterface();
        projectid = $("#showprojectname").val();
        if(projectid=='Project Name'){
            usermsgfun("Please Select Project Name ")
            return
        }
        document.getElementById("staffdialog").style.display="block";
        document.getElementById("staffreport1").style.display="block";
        document.getElementById("staffavdialog").style.display = "block";
        document.getElementById("aadtaskdialogbox").style.display="none";
        document.getElementById("showkanbanboarddata").style.display="none";
        document.getElementById("adddtask").style.display="block";
        document.getElementById("updateinfodig").style.display="none";
        document.getElementById("insertloginfo").style.display="none";
        document.getElementById("insertinfo").style.display="none";
        document.getElementById("dialogbox").style.display="none";
        document.getElementById("fileadd").style.display="none";
        document.getElementById("chatgroupdiv").style.display="none";
        showstaffreport();
    }

    function closestaffbtn(){
        document.getElementById("staffdialog").style.display="none";
        document.getElementById("staffreport1").style.display="none";
    }

    function searchmn(){
        if($("#usermobilenumber").val()==='' ){
             alert("Please enter mobile number or name")
             return
        }
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'searchmn',
                mobileno:$("#usermobilenumber").val(),
            },
            cache: false,
            success: function user(res) {
                    if (res === 'sessionexpired') {
                        alert("Session Expired, Please login Again");
                        window.location.replace("/1/login");
                    } else if (Array.isArray(res)) {
                        // User is registered, update HTML elements
                        document.getElementById("username1").value = res[1];
                        document.getElementById("useremail1").value = res[2];
                    } else {
                        // User is not registered or another error occurred
                        usermsgfun(res);
                    }  
            }
        })
    }
    function savepositioninformation(){
        projectid = $("#showprojectname").val();
         //alert(projectid  +"   projectid")
         //document.getElementById("loader2").style.visibility='visible'
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                    action: 'savepositioninformation',
                    addposition:$("#addposition").val(),
                    usermobilenumber:$("#usermobilenumber").val(),
                    username:$("#username1").val(),
                    useremail:$("#useremail1").val(),
                    projectid:projectid
                },
                cache: false,
                success: function user(res) {
                //document.getElementById("loader2").style.visibility='hidden'
            if (res === 'sessionexpired') {
                alert("Session Expired, Please login Again");
                window.location.replace("/1/login");
            } else {
                if (res === 'Assing staff') {
                    usermsgfun("Staff Save Successfully");
                    showstaffreport();
                    addposition.value = '';
                    usermobilenumber.value = '';
                    username1.value = '';
                    useremail1.value = '';
                } else {
                    usermsgfun(res);
                    showstaffreport();
                }
               }
                }
            })
            // setTimeout(function () {
            //     document.getElementById("loader2").style.visibility = 'hidden';
            // }, 2000);
        }
                             //  *** Setting   //
 function settinginfo(){
    retriveorginfo();
    retrivestatus();
    retriveallstatus();
    document.getElementById("setting").style.display="block";
    document.getElementById("mainmenu").style.display="none";
 
// gettaskregister();
}
function closesetting(){
document.getElementById("setting").style.display="none";
document.getElementById("mainmenu").style.display="block";
}

function savestatus() {
//document.getElementById("loader2").style.visibility = 'visible'; // Show loader
$.ajax({
    url: "/1/taskregister",
    type: 'POST',
    data: {
        action: 'savestatus',
        newstatus: $("#newstatus").val()
    },
    cache: false,
    success: function user(res) {
        if (res === 'sessionexpired') {
            alert("Session Expired, Please login Again")
            window.location.replace("/1/login")
        } else {
            if (res === 'Data inserted.') {
                usermsgfun(" Status Save Successfully ")
                retrivestatus();
            } else {
                usermsgfun(res);
            }
        }
    }
});
// setTimeout(function () {
//     document.getElementById("loader2").style.visibility = 'hidden';
// }, 2000);
}

function retrivestatus(){
// alert("hello")
$.ajax({
    url:"/1/taskregister",
    type: 'POST',
    data: {
        action: 'retrivestatus',
    },
    cache: false,
    success: function savecaller(res) {
        //alert(res)
        var slsn1 = document.getElementById("selectestatus")
        
        if(slsn1!=null){
            slsn1.length = 0
            // slsn1[slsn1.length] = new Option('Status')
            for (i = 0; i < res.length; i++) {
                var myOption = document.createElement("option");
                try{
                    var x=JSON.parse(res[i]);
                    myOption.text = x.statusname;
                        //myOption.value = x.orgid;
                    slsn1.add(myOption);
                }catch(err)
                {
                    
                }
            }
        }      
    }
})
}
function retriveallstatus(){
// alert("hello")
$.ajax({
    url:"/1/taskregister",
    type: 'POST',
    data: {
        action: 'retriveallstatus',
    },
    cache: false,
    
    success: function savecaller(res) {
        //alert(res)
        var slsn1 = document.getElementById("allstatus")
        
        if(slsn1!=null){
            slsn1.length = 0
            slsn1[slsn1.length] = new Option('Select')
            for (i = 0; i < res.length; i++) {
                var myOption = document.createElement("option");
                try{
                    var x=JSON.parse(res[i]);
                    myOption.text = x.statusname;
                    slsn1.add(myOption);
                }catch(err)
                {
                    
                }
            }
        }      
    }
})
}
function addstatus1() {
//document.getElementById("loader2").style.visibility = 'visible'; // Show loader
$.ajax({
    url: "/1/taskregister",
    type: 'POST',
    data: {
        action: 'addstatus1',
        allstatus: $("#allstatus").val()
    },
    cache: false,
    success: function user(res) {
        //document.getElementById("loader2").style.visibility = 'hidden'; // Hide loader
        if (res === 'sessionexpired') {
            alert("Session Expired, Please login Again");
            window.location.replace("/1/login");
        } else {
            if (res === 'Data inserted.') {
                usermsgfun("Status Save Successfully")
                retrivestatus();
            } else {
                usermsgfun(res);
            }
        }
    }
});
}
function retrivetaskstatus(){
//  alert("hello")
$.ajax({
    url:"/1/taskregister",
    type: 'POST',
    data: {
        action: 'retrivetaskstatus',
    },
    cache: false,
    success: function savecaller(res) {
        // alert(res)
        var slsn1 = document.getElementById("addtaskstatus")
        
        if(slsn1!=null){
            slsn1.length = 0
            slsn1[slsn1.length] = new Option('Status')
            for (i = 0; i < res.length; i++) {
                var myOption = document.createElement("option");
                try{
                    var x=JSON.parse(res[i]);
                    myOption.text = x.statusname;
                    //myOption.value = x.orgid;
                    slsn1.add(myOption);
                }catch(err)
                {   
                }
            }
        }      
    }
})
}
function retrivetaskstatus1(){
// alert("hello")
$.ajax({
    url:"/1/taskregister",
    type: 'POST',
    data: {
        action: 'retrivetaskstatus1',
    },
    cache: false,
    success: function savecaller(res) {
    //    alert(res)
        var slsn1 = document.getElementById("addtaskstatusi")
        if(slsn1!=null){
            slsn1.length = 0
            slsn1[slsn1.length] = new Option('Status')
            for (i = 0; i < res.length; i++) {
                var myOption = document.createElement("option");
                try{
                    var x=JSON.parse(res[i]);
                    myOption.text = x.statusname;
                    slsn1.add(myOption);
                }catch(err)
                {
                    
                }
            }
        }      
    }
})
}   


                             //  *** Delet functions //
function deleteuploadfile1(fileId,logtext){
    //alert(fileId +"- fileId")
    //alert(logtext)
    //document.getElementById("loader3").style.visibility='visible'
    var ans = confirm("Do You Want TO Deleted This file")
    if(ans==true){
    $.ajax({
        url: "/1/taskregister",
        type: 'POST',
        data: {
            action: 'deleteuploadfile1',
            fileId:fileId,
            logtext:logtext
        },
        cache: false,
        success: function user(res) {
            // document.getElementById("loader3").style.visibility='hidden'
            if (res === 'sessionexpired') {
                alert("Session Expired, Please login Again")
                window.location.replace("/1/login")
            } else {
                if (res === 'Delete file') {
                    usermsgfun("File Deleted")
                    // Show log after file deletion
                    showlog(taskid);
                } else {
                    usermsgfun(res)
                }
            }
        }
    })
}
}
    function deleteprojectinfo(){
        clearInterface();
        projectid = $("#showprojectname").val();
         if(projectid=='Project Name'){
            usermsgfun("Please Select Project Name ")
            return
        }
        var ans = confirm("Do You Want TO Deleted This Project")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'deleteprojectinfo',
                projectid:projectid,
                
           },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Delete project name'){
                        usermsgfun("Project Deleted")
                        retriveprojectname();
                       // showkanbanboard();
                    }else{
                        usermsgfun(res)
                    }
                }
                
                }
            })
        }
    }
    function deletestatus(){
        statusname = $("#selectestatus").val();
        var ans = confirm("Do You Want TO Deleted This Status")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'deletestatus',
                statusname:statusname,
           },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Delete status name and associated tasks'){
                        usermsgfun("Status Deleted")
                        retrivestatus();
                    }else{
                        usermsgfun(res)
                    }
                }
                }
        })
    }
    }
    function deletestaffinfo(userid){
        //document.getElementById("loader3").style.visibility='visible'
        projectid = $("#showprojectname").val();
       // alert(projectid)
        var ans = confirm("Do You Want TO Deleted This Staff")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'deletestaffinfo',
                userid:userid,
                projectid:projectid
            },
            cache: false,
            success: function user(res) {
                //document.getElementById("loader3").style.visibility='hidden'
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Staff Deleted'){
                        usermsgfun("Staff Deleted")
                       showstaffreport();
                    }else{
                        usermsgfun(res)
                    }
                }
            }
        })
        }
    }
    
    function deletselectedlog(logid){
        var ans = confirm("Do You Want TO Deleted This log")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'deletselectedlog',
                logid:logid,
            },
            cache: false,
            success: function user(res) {
                //document.getElementById("loader3").style.visibility='hidden'
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Delete file'){
                        usermsgfun("Log Deleted")
                        showlog(taskid);
                    }else{
                        usermsgfun(res)
                    }
                }
            }
        })
      } 
    }
    function deletetaskinfo1(){
        var hiddenbox1 = document.getElementById('taskidk');
        var taskid = hiddenbox1.value;
        //alert(taskid +   "   Delete taskid")
        //document.getElementById("loader3").style.visibility='visible'
        var ans = confirm("Do You Want TO Deleted This Task")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'deletetaskinfo1',
                taskid:taskid
            },
            cache: false,
            success: function user(res) {
                //document.getElementById("loader3").style.visibility='hidden'
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Task Deleted'){
                        usermsgfun("Task Deleted")
                        showprojandkan();
                    }else{
                        usermsgfun(res)
                    }
                }
            }
        })
        }
    }

    //chat function //
    function chatgroup(){
        clearInterface();
        projectid = $("#showprojectname").val();
        if(projectid=='Project Name'){
            usermsgfun("Please Select Project Name ")
            return
        }
        document.getElementById("staffdialog").style.display="none";
        document.getElementById("staffavdialog").style.display = "none";
        document.getElementById("aadtaskdialogbox").style.display="none";
        document.getElementById("showkanbanboarddata").style.display="none";
        document.getElementById("adddtask").style.display="block";
        document.getElementById("updateinfodig").style.display="none";
        document.getElementById("insertloginfo").style.display="none";
        document.getElementById("insertinfo").style.display="none";
        document.getElementById("fileadd").style.display="none";
        document.getElementById("dialogbox").style.display="none";
        //document.getElementById("")
        document.getElementById("chatgroupdiv").style.display="block";
        document.getElementById("showkanbanboarddata").style.display="none";
        document.getElementById("chatgroupdialog").style.display = "block";
        retrivfunctions();
    }
     function retrivfunctions(){
        retrivsubjectname();
        retrivemember();
    }
    function closechatgroupdialog(){
        document.getElementById("chatgroupdiv").style.display="none";
        document.getElementById("chatgroupdialog").style.display="none";
        document.getElementById("showgroupreport").style.display="none";

    }
    function subjectnamesave() {
        var subjectNameValue = $("#subjectname").val().trim();
    
        if (subjectNameValue === '') {
            usermsgfun("Please Add Group Name");
            return;
        }
    
        var projectid = $("#showprojectname").val();
    
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'subjectnamesave',
                projectid: projectid,
                subjectname: subjectNameValue
            },
            cache: false,
            success: function user(res) {
                usermsgfun("Group Name Save Successfully");
                $("#subjectname").val(''); // Clear the input field
                retrivsubjectname();
            }
        });
    }
    
    function retrivsubjectname(){
        projectid = $("#showprojectname").val();
        //alert(projectid )
         //alert("subject")
         $.ajax({
             url: "/1/taskregister",
             type: 'POST',
             data: {
                 action: 'retrivsubjectname',
                 projectid:projectid
             },
             cache: false,
             success: function user(res) {
                //alert (res);
                 var slsn1 = document.getElementById("subjectnamed")
                 if(slsn1!=null){
                 slsn1.length = 0
                 slsn1[slsn1.length] = new Option('Select')
                     for (i = 0; i < res.length; i++) {
                         var myOption = document.createElement("option");
                         try{
                             var x=JSON.parse(res[i]);
                             myOption.text = x.subjectname;
                             myOption.value = x.subjectid;
                             slsn1.add(myOption);
                         }catch(err){
                                 
                         }
                     }
                 }
             }
         })
     }
     function retrivemember(){
        projectid = $("#showprojectname").val();
          //alert("project maneger")
            $.ajax({
                url: "/1/taskregister",
                type: 'POST',
                data: {
                    action: 'retrivemember',
                    projectid:projectid
                },
                cache: false,
                success: function user(res) {
                    // alert (res);
                    var slsn1 = document.getElementById("addmember")
                    if(slsn1!=null){
                    slsn1.length = 0
                    slsn1[slsn1.length] = new Option('Select')
                        for (i = 0; i < res.length; i++){
                            var myOption = document.createElement("option");
                            try{
                                var x=JSON.parse(res[i]);
                                myOption.text = x.name;
                                myOption.value = x.userid;
                                slsn1.add(myOption);
                            }catch(err){
                                    
                            }
                        }
                    }
                }
            })
    }
    function savegroup() {
        var projectid = $("#showprojectname").val();
        var subjectid = $("#subjectnamed").val();
        var groupmember = $("#addmember").val();
    
        // Check for undefined, null, or empty values
        if (!projectid || !subjectid || !groupmember || subjectid=='Select' ||groupmember=='Select' ) {
            alert("Please fill in all required fields");
            return;
        }
    
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'savegroup',
                groupmember: groupmember,
                subjectid: subjectid,
                projectid: projectid
            },
            cache: false,
            success: function user(res) {
                groupreport();
                usermsgfun(res);
            }
        });
    }
    function showchatinfo(){
        projectid = $("#showprojectname").val();
        //alert(projectid)
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'showchatinfo',
                projectid:projectid
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    //alert(res)
                    document.getElementById("showchat").innerHTML=res    
                }  
            }
        })
    }
    function savechat() {
        clearInterface();
        var hiddenbox5 = document.getElementById('subjectid');
        var subjectid = hiddenbox5.value; 
         //alert(subjectid + "!!!!!!!!!!!!!!!!!!");
        var projectid = $("#showprojectname").val();
        document.getElementById("loader2").style.visibility='visible';
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'savechat',
                chatinfo: $("#messageinfo").val(),
                subjectid: subjectid,
                projectid: projectid
            },
            cache: false,
            success: function user(res) {
                document.getElementById("loader2").style.visibility='hidden';
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    usermsgfun(res)
                showchatting(subjectid);
                messageinfo.value = '';
                }
            }
        });
    }
    //var start='';
    
    var chatInterval=setInterval('', 0);
    
    function clearInterface() {
        clearInterval(chatInterval);
        //console.log(chatInterval +"   chatInterval")
    }
    function showchatting(subjectid){
        getchatdate();
        clearInterface();
        chatInterval=setInterval(function() {
            projectid = $("#showprojectname").val();
            var lastchattime = document.getElementById('lastchattime').value;
            // console.log(lastchattime+" lastchattime")
            $.ajax({
                url: "/1/taskregister",
                type: 'POST',
                data:{
                    action: 'showchatting',                                                                                                                         
                    projectid:projectid,
                    subjectid:subjectid,
                    lastchattime:lastchattime
                },
                cache: false,
                success: function user(res) {
                    //console.log(lastchattime  +" Date")
                    if(res === 'sessionexpired'){
                        alert("Session Expired, Please login Again")
                        window.location.replace("/1/login")
                    }else if(res === "NORECENTCHAT")  
                    {
                        console.log("NORECENTCHAT")
                    }
                    else{ 
                    document.getElementById("showchat1").innerHTML=document.getElementById("showchat1").innerHTML+res ;
                    //lastchattime="start"; 
                    }
                    var newdate=new Date();
                    newdate= newdate.getFullYear()+'-'+("0" + (newdate.getMonth() + 1)).slice(-2)+'-'+("0" + newdate.getDate()).slice(-2) +" "+newdate.getHours()+':'+newdate.getMinutes()+':'+newdate.getSeconds();  
                    //alert(newdate +"newdate")  
                    document.getElementById("lastchattime").value=newdate;
                    lastchattime=newdate;
                }
            })
        },2000)
    }
    function getchatdate(){
        // if($("#lastchattime").value=='') 
        document.getElementById("showchat1").innerHTML='';
        document.getElementById("lastchattime").value='1900-01-01 00:00:00';
    }
    function groupnamelist1(){
        projectid = $("#showprojectname").val();
            $.ajax({
                url: "/1/taskregister",
                type: 'POST',
                data: {
                    action: 'groupnamelist1',
                    projectid:projectid,
                },
                cache: false,
                success: function user(res) {
                    if(res === 'sessionexpired'){
                        alert("Session Expired, Please login Again")
                        window.location.replace("/1/login")
                    }else{
                           //alert(res)
                            document.getElementById("groupnamelist").innerHTML=res   
                    }  
                }
            })
    }
// function groupnamelist1() {
// projectid = $("#showprojectname").val();
// $.ajax({
//     url: "/1/taskregister",
//     type: 'POST',
//     data: {
//         action: 'groupnamelist1',
//         projectid: projectid,
//     },
//     cache: false,
//     success: function user(res) {
//         if (res === 'sessionexpired') {
//             alert("Session Expired, Please login Again")
//             window.location.replace("/1/login")
//         } else {
//             document.getElementById("groupnamelist").innerHTML = res;
//             // Assuming you have some way to select the chat group, let's say through a class named 'chat-group'
//             $('.chat-group').click(function() {
//                 var subjectid = $(this).data('subjectid'); // Assuming subjectid is stored as a data attribute
//                 showchatting(subjectid);
//             });
//         }
//     }
// })
// }
function showchatsubject(subjectid){
    projectid = $("#showprojectname").val();
    //alert(subjectid) 
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'showchatsubject',
                projectid:projectid,
                subjectid:subjectid
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                        //alert(res)
                        document.getElementById("showselectgroup").innerHTML=res 
                }  
            }
        })
}
function passsubid(subjectid) {
    var hiddenbox5 = document.getElementById('subjectid');
    hiddenbox5.value = subjectid;
}
   
    function showusers2(){
        clearInterface();
        var hiddenbox5 = document.getElementById('subjectid');
        var subjectid = hiddenbox5.value;
        if(subjectid==''){
            alert("Please Select Group First ")
            return
        } 
        var projectid = $("#showprojectname").val();
        document.getElementById("staffdialogs").style.display="block";
        document.getElementById("showusers").style.display="block";
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'showusers',
                projectid:projectid,
                subjectid:subjectid
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                       //alert(res)
                        document.getElementById("showstaffselectedgroup").innerHTML=res     
                }  
            }
        })
    }
    function closedialogboxuserinfodialog(){
        document.getElementById("staffdialogs").style.display="none";
        document.getElementById("showusers").style.display="none";
    }
    function showrepotrongroup(){
        document.getElementById("showgroupreport").style.display="block";
        groupreport();
    }
    function groupreport(){
        clearInterface();
        projectid = $("#showprojectname").val();
        subjectid = $("#subjectnamed").val();
        //alert(subjectid+" show report")
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'groupreport', 
                projectid:projectid,
                subjectid:subjectid
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res != 'No Record') {
                        
                        document.getElementById("showgroupreport").innerHTML=res;      
                    }
                }  
                // function handleFileChange(input) {
                //     const file = input.files[0];
                //     alert(`Selected file: ${file.name}`);
                //   }
                    //alert(res);    
            }
        })
    }
    function leftgroup(userid){
        //document.getElementById("loader3").style.visibility='visible'
        projectid = $("#showprojectname").val();
        subjectid = $("#subjectnamed").val();
        // alert(subjectid +"subjectid")
        // alert(userid +" ")
        var ans = confirm("Do You Want TO Deleted This Staff")
        if(ans==true){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'leftgroup',
                userid:userid,
                projectid:projectid,
                subjectid:subjectid
            },
            cache: false,
            success: function user(res) {
                //document.getElementById("loader3").style.visibility='hidden'
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res==='Remove'){
                        groupreport();
                    }else{
                        //alert(res)
                    }
                }
            }
        })
        }
    }
    // Account Status 
    function acountstatus(){
        getaccountdetails();
        document.getElementById("mainmenu").style.display='none';
        document.getElementById("acountstatusinfo").style.display='block';
    }
    function cancelaccountstatuspage(){
        document.getElementById("acountstatusinfo").style.display='none';
        document.getElementById("mainmenu").style.display='block'
    }
    function getaccountdetails(){
        $.ajax({
            url: "/1/taskregister",
            type: 'POST',
            data: {
                action: 'getaccountdetails',
            },
            cache: false,
            success: function user(res) {
                if(res === 'sessionexpired'){
                    alert("Session Expired, Please login Again")
                    window.location.replace("/1/login")
                }else{
                    if(res === "error"){
                        alert("Please check internet connection if the problem persists, contact us")
                    }else{
                        var stdate = new Date(res[2]);
                        var edate = new Date(res[3]);
                        edate = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
                        stdate = stdate.getFullYear() + '-' + ('0' + (stdate.getMonth() + 1)).slice(-2) + '-' + ('0' + stdate.getDate()).slice(-2);
                        document.getElementById("state").value = res[0];
                        document.getElementById("valid").value = res[1];
                        document.getElementById("stdate").value = stdate;
                        document.getElementById("eddate").value = edate;    
                       // document.getElementById("usedquota").value = res[4]+"MB";
                        if (res[4] === "" || res[4] === undefined || res[4] === null || res[4] === "null") {
                            document.getElementById("usedquota").value = "0 MB";
                        }else{
                            document.getElementById("usedquota").value= res[4]+"MB"  
                        }
                        if (res[5] === "" || res[5] === undefined || res[5] === null || res[5] === "null") {
                            document.getElementById("quota").value = "0 MB";
                        }else{
                            document.getElementById("quota").value= res[5]+"MB"  
                        }
                    }
                }       
            }
        })
    }
    