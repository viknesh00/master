export const getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  export const setCookie = (name, value) => {
    // var d = new Date();
    // d.setTime(d.getTime() + (2*1000));
    // var expires = "expires=" + d.toGMTString();
    // //console.log(expires);
    // document.cookie = name + "=" + value + ";" + expires + ";path=/";
    // alert(expires);
    // var d = new Date();
    // //console.log(d,"date1");
    // d.setTime(d.getTime() + (maxAgeSeconds*1000));
    // //console.log(d,"date2");
    // var expires = "expires="+ d;
    let cookieData =  encodeURI(name) + "=" + encodeURI(value) + ";";
    //console.log(expires);
    // if(expires) {
    //   var d = new Date(expires);
    //   //console.log(d);
    //   cookieData = cookieData + " expires=" + d.toGMTString() + ";";
    // }
    cookieData = cookieData + " path = /;"
    document.cookie = cookieData;
  };
  export const cookieKeys = (user) => {
    var userList = Object.keys(user);
    userList.map((item)=>{
      setCookie(`${item}`, user[`${item}`]);
    })
    console.log(userList);
  
  };
  