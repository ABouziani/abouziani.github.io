let container = `<div class="container">
        <div class="userrow">
            <div class="userPerso">
                <div class="fullName">John Doe</div>
                <div class="email">john.doe@example.com</div>
                <div class="phoneNumber">+1234567890</div>
            </div>
            <div class="userInfos">
                <div class="level">Level: 5</div>
                <div class="xpAmount">XP: 1200</div>
                <div class="ratio">Ratio: 85%</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100" viewBox="0 0 400 100" fill="red" preserveAspectRatio="xMidYMid meet">
                <text x="10" y="15" font-size="smaller" fill="white">Done</text>      
                <rect class="up" x="10" y="30" height="10" rx="10" fill="#404241"/>
                <text x="10" y="65" font-size="smaller" fill="white">Received</text>      
                <rect class="down" x="10" y="80"  height="10" rx="10" fill="#202121"/>
                </svg>
            </div>
        </div>
        <div class="techrow">
        <div class="radar">
        <h1>Skills :</h1>
        <div id="tooltip" class="tooltip"></div>
        <svg id="radarChart" width="100%" height="400" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div id="xpchart">
        <h1>XP progression :</h1>
        </div>
        </div>
    </div>`

const signendpoint = "https://learn.zone01oujda.ma/api/auth/signin"
const dataendpoint = "https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql"
let userInfos = {}

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
  dom.querySelector('.fullName').innerText = userInfos.firstName + " " + userInfos.lastName
  dom.querySelector('.email').innerText = userInfos.email
  dom.querySelector('.phoneNumber').innerText = userInfos.tel
  dom.querySelector('.level').innerText = userInfos.level
  dom.querySelector('.xpAmount').innerText = userInfos.xpAmount
  dom.querySelector('.ratio').innerText = userInfos.ratio
  let max = Math.max(userInfos.totalUp, userInfos.totalDown);
  dom.querySelector('.up').setAttribute('width', (userInfos.totalUp / max) * 300)
  dom.querySelector('.down').setAttribute('width', (userInfos.totalDown / max) * 300)
  document.body.innerHTML = dom.body.innerHTML
  drawRadar(userInfos.skills)
  drawXpChart(userInfos.xpProgress)
}



window.addEventListener('resize', () => {
  if (document.body.clientWidth < 1000) {
    let userrow = document.querySelector('.userrow')  
    let techrow = document.querySelector('.techrow')  
    userrow.style.flexFlow = "column";
    userrow.style.gap = "10px";
    techrow.style.flexFlow = "column";
    techrow.style.gap = "10px";
  } else {
    document.querySelector('.userrow').style.flexFlow = "row";
    document.querySelector('.techrow').style.flexFlow = "row";
  }
})