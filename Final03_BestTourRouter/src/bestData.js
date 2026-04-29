//배열 데이터만 담을 js파일
const initialBests = [
  {
    id: 1,
    name: "[프랑스] 오르세 프리미엄투어[오후]",
    price: 20000,
    descript: "프랑스 3대 미술관 중 하나로 뽑히며, 반고흐, 마네, 모네 등의 작품을 감상",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fk0adz%2Fbtsydna0uHj%2FAAAAAAAAAAAAAAAAAAAAAOWukE3A4Q_JH8SouR7GFkgpy-IuXUIVMoUTkqJ-1MX9%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3DWXRuptbR%252BYozgUhe9Z0uxdsdfOw%253D",
    like: false
  },
  {
    id: 2,
    name: "[이탈리아] 피렌체투어(우피치포함)",
    price: 23000,
    descript: "꽃의 도시. 피렌체 역사 중 가장 화려했던 14세기 르네상스 시대로의 여행",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fbmakiu%2FbtsyenIDeD8%2FAAAAAAAAAAAAAAAAAAAAAK3FkNnN-WrZrr7HLxnz1FF3Y4IEOtrP8QnXRixNTzW3%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3D3ZG%252BIzZhfdATEEK88PvzRB7tfV4%253D",
    like: false
  },
  {
    id: 3,
    name: "[헝가리] 부다페스트 야경투어",
    price: 25000,
    descript: "유럽 3대 야경 중 하나인 부다페스트 야경은 안전하고 아름답게 여행",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fl6QZI%2FbtsynB6Vt9I%2FAAAAAAAAAAAAAAAAAAAAAFYj8_st59xrSI6JVqssepE19-9o98snrC01JPhQA1HY%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3DwUYerm%252FhbP0nkmW296XB0bxvgRQ%253D",
    like: false
  },
  {
    id: 4,
    name: "[체코] 베스트 체스키 끄르믈로프투어",
    price: 25000,
    descript: "마치 동화에 나올 법한 빨간 지붕 중세마을이 그림처럼 소담하게 들어 앉아 있는 곳",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbaN3Yb%2FbtsypwK3WoE%2FAAAAAAAAAAAAAAAAAAAAAP7YIBJUOfJfundDX4ZoyTgRB2k3QWhAEmhb6fo83wrK%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3D%252FI81WN15%252BEnOOa8WqzvUGWywWtE%253D",
    like: false
  },
  {
    id: 5,
    name: "[크로아티아] 두브로브니크 스르지산 투어",
    price: 20000,
    descript: "왕좌의 게임 촬영지, 두브로브니크 시내를 한눈에 볼 수 있는 스르지산 투어",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcfnV8L%2FbtsyaUglYOD%2FAAAAAAAAAAAAAAAAAAAAAE53IFR-ZBQ04gF7rns37zvrgxyLfHfhFBcoBd-myVCo%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3DhJ86bXhOmD6H0oEJKrZ34LmfoMc%253D",
    like: false
  },
  {
    id: 6,
    name: "[프랑스] 루브르 프리미엄투어(소규모/오전)",
    price: 25000,
    descript: "건축 규모, 소장품 수, 역사의 시간 등 모든 부분의 세계 최고 프랑스 박물관",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FL8rOa%2FbtsygnaTPE5%2FAAAAAAAAAAAAAAAAAAAAAOBu3_v6d9Yp8jxMYAlF22RCso_J7NgT3jnhQMdLyCc6%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3DKF87qjJhYHumu%252FK27M1QzIv4ffA%253D",
    like: false
  },
  {
    id: 7,
    name: "[이탈리아] 남부환상투어(~10/27)",
    price: 70000,
    descript: "내셔널지오그래픽 트레블러 선정, 죽기 전에 꼭 가봐야할 50곳 중 1위",
    image: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FclWmDF%2FbtsybQLxx0X%2FAAAAAAAAAAAAAAAAAAAAAM4-RHqal5peLXjIGnFe-IcDPsVPwwshtnXRUCtzqXbt%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1777561199%26allow_ip%3D%26allow_referer%3D%26signature%3DJoNRMXQyPKsU1k46Mr7CM0h%252BFG4%253D",
    like: false
  }
];

export { initialBests };