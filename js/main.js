let loginHTML  = `<div class="login-container">
        <h2>Zone01 GraphQl</h2>
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" value="abouziani" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" required>
            </div>
            <button onclick="connect()" class="login-btn">Login</button>
    </div>`

let container = `<div class="fixehome"></div>
<div class="container">
    <div class="userrow">
        <div class="userPerso">
            <label for="fullName">Full Name: </label>
            <div class="fullName"></div>

            <label for="email">Email: </label>
            <div class="email"></div>

            <label for="phoneNumber">Phone Num: </label>
            <div class="phoneNumber"></div>
            <button onclick="logout()" class="logout-btn">Logout</button>
        </div>
        <div class="userInfos">
            <label for="level">Level: </label>
            <div class="level"></div>

            <label for="xpAmount">XP: </label>
            <div class="xpAmount"></div>

            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100" viewBox="0 0 400 100" fill="red"
                preserveAspectRatio="xMidYMid meet">
                <text class="done" x="10" y="15" fill="white"></text>
                <rect class="up" x="10" y="30" height="10" rx="10" fill="#404241" />
                <text class="received" x="10" y="65" fill="white"></text>
                <rect class="down" x="10" y="80" height="10" rx="10" fill="#202121" />
            </svg>
            <label for="ratio">Ratio: </label>
            <div class="ratio" ></div>
        </div>
    </div>
    <div class="techrow">
        <div class="radar">
            <h1>Skills :</h1>
            <div id="tooltip" class="tooltip"></div>
            <svg id="radarChart" viewBox="0 0 430 400" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div class="xpchart">
            <h1>XP progression :</h1>
        </div>
    </div>
</div>`

const signendpoint = "https://learn.zone01oujda.ma/api/auth/signin"
const dataendpoint = "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql"
let userInfos = {}


if (!localStorage.getItem('JWT')){
  document.body.innerHTML = loginHTML
} else {
  fetchData(localStorage.getItem('JWT'))
}


function connect() {
  let username = document.querySelector("#username").value
  let password = document.querySelector("#password").value
  let auth = btoa(username + ":" + password)
  fetch(signendpoint, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + auth
    }
  }).then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error(response.status);
    }
  }).then(jwt => {
    localStorage.setItem('JWT',jwt)
    fetchData(jwt)
  }).catch(error => console.log(error))
}


function fetchData(jwt) {
  const Query = `{
  user{
    firstName
    lastName
    email
    login
    attrs
    totalUp
    totalDown
    auditRatio
    xpAmount : transactions_aggregate(where:{
    _and: [
      { type: { _like: "xp" } },
      { 
        _or: [
          { originEventId: { _eq: 41 } },
          { path: { _ilike: "/oujda/module/checkpoint/%" } },
          { path: { _ilike: "/oujda/module/piscine-js" } }
        ]
      }
    ]
  }){
    xp:aggregate{
      xp:sum{
        amount
      }
    }
  }
    
    level : transactions_aggregate( where :{
       _and : [
      {type : {_like : "level"}},
    {originEventId : {_eq : 41}},
    ]}
    ){
      level:aggregate{
        level:max{
          amount
        }
      }
    }
    
    skills : transactions (where : {type : {_like:"skill_%"}}) {
    type
      amount
    }
  }
    
xpProgress:transaction(where:{
    _and: [
      { type: { _like: "xp" } },
      { 
        _or: [
          { originEventId: { _eq: 41 } },
          { path: { _ilike: "/oujda/module/piscine-js" } },
           { path: { _ilike: "/oujda/module/checkpoint/%" } }
        ]
      }
    ]
  }){
  createdAt
  amount
}

}`

  fetch(dataendpoint, {
    method: 'POST',

    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + jwt,
    },

    body: JSON.stringify({
      query: Query
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json()
  }).then(data => {
    console.log(data);

    userInfos.firstName = data.data.user[0].firstName
    userInfos.lastName = data.data.user[0].lastName
    userInfos.email = data.data.user[0].email
    userInfos.tel = data.data.user[0].attrs.tel
    userInfos.login = data.data.user[0].login
    userInfos.totalUp = data.data.user[0].totalUp
    userInfos.totalDown = data.data.user[0].totalDown
    userInfos.xpAmount = data.data.user[0].xpAmount.xp.xp.amount
    userInfos.level = data.data.user[0].level.level.level.amount
    userInfos.skills = {}
    userInfos.ratio = data.data.user[0].auditRatio.toFixed(2)
    data.data.user[0].skills.forEach(skill => {
      if (!userInfos.skills[skill.type] || skill.amount > userInfos.skills[skill.type]) {
        userInfos.skills[skill.type] = skill.amount;
      }
    });
    userInfos.xpProgress = []
    userInfos.xpProgress = data.data.xpProgress
    showData()
  }).catch(err => console.log(err))
}

function showData() {
  let dom = new DOMParser().parseFromString(container, 'text/html')
  dom.querySelector('.fullName').innerText = `${userInfos.firstName} ${userInfos.lastName}`
  dom.querySelector('.email').innerText = userInfos.email
  dom.querySelector('.phoneNumber').innerText = userInfos.tel
  dom.querySelector('.level').innerText = userInfos.level
  dom.querySelector('.xpAmount').innerText = userInfos.xpAmount
  dom.querySelector('.ratio').innerText = userInfos.ratio
  let max = Math.max(userInfos.totalUp, userInfos.totalDown);
  dom.querySelector('.up').setAttribute('width', (userInfos.totalUp / max) * 300)
  dom.querySelector('.down').setAttribute('width', (userInfos.totalDown / max) * 300)
  dom.querySelector('.done').textContent = `Done: (${userInfos.totalUp})`
  dom.querySelector('.received').textContent = `Received: (${userInfos.totalDown})`
  document.body.innerHTML = dom.body.innerHTML
  drawRadar(userInfos.skills)
  drawXpChart(userInfos.xpProgress)
}



function logout(){
  localStorage.removeItem('JWT')
  document.body.innerHTML = loginHTML
}