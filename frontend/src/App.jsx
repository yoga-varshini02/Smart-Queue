import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function App() {

  // ==================================================
  // WAITING TIME
  // ==================================================

  const getWaitingTime = () => {

    const totalMinutes =
      (peopleAhead || 0) * 5

    const hours =
      Math.floor(totalMinutes / 60)

    const minutes =
      totalMinutes % 60

    if (hours === 0) {
      return `${minutes} minutes`
    }

    if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`
    }

    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`
  }


  // ==================================================
  // LOGIN STATE
  // ==================================================

  const [isRegister, setIsRegister] =
    useState(false)

  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {
      return localStorage.getItem(
        'smartqueue_loggedIn'
      ) === 'true'
    })

  const [isAdmin, setIsAdmin] =
    useState(() => {

      const savedUser =
        localStorage.getItem(
          'smartqueue_user'
        )

      if (savedUser) {

        try {

          const user =
            JSON.parse(savedUser)

          return user.role === 'ADMIN'

        } catch (error) {

          return false

        }
      }

      return false
    })


  // ==================================================
  // ADMIN STATE
  // ==================================================

  const [waitingTokens, setWaitingTokens] =
    useState([])

  const [servingTokens, setServingTokens] =
    useState([])


  // ==================================================
  // TOKEN HISTORY
  // ==================================================

  const [tokenHistory, setTokenHistory] =
    useState([])

  const [showHistory, setShowHistory] =
    useState(false)


  // ==================================================
  // LOGIN DETAILS
  // ==================================================

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')


  // ==================================================
  // REGISTER DETAILS
  // ==================================================

  const [rationCardNo, setRationCardNo] =
    useState('')

  const [userName, setUserName] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [familyMembers, setFamilyMembers] =
    useState('')

  const [address, setAddress] =
    useState('')


  // ==================================================
  // MESSAGE
  // ==================================================

  const [message, setMessage] =
    useState('')


  // ==================================================
  // CURRENT USER
  // ==================================================

  const [currentUser, setCurrentUser] =
    useState(() => {

      const savedUser =
        localStorage.getItem(
          'smartqueue_user'
        )

      if (savedUser) {

        try {
          return JSON.parse(savedUser)
        } catch (error) {
          return null
        }

      }

      return null
    })


  // ==================================================
  // TOKEN
  // ==================================================

  const [token, setToken] =
    useState(() => {

      const savedToken =
        localStorage.getItem(
          'smartqueue_token'
        )

      if (savedToken) {

        try {
          return JSON.parse(savedToken)
        } catch (error) {
          return null
        }

      }

      return null
    })


  // ==================================================
  // PEOPLE AHEAD
  // ==================================================

  const [peopleAhead, setPeopleAhead] =
    useState(() => {

      const savedPeople =
        localStorage.getItem(
          'smartqueue_peopleAhead'
        )

      if (savedPeople) {
        return Number(savedPeople)
      }

      return null
    })


  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              email: email,
              password: password
            })
          }
        )


      if (!response.ok) {

        setMessage(
          'Invalid email or password'
        )

        return
      }


      const result =
        await response.json()


      // ==================================================
      // ADMIN LOGIN
      // ==================================================

      if (result.role === 'ADMIN') {

        setCurrentUser(result)

        setIsAdmin(true)

        setIsLoggedIn(true)

        setMessage(
          'Admin login successful'
        )


        localStorage.setItem(
          'smartqueue_loggedIn',
          'true'
        )


        localStorage.setItem(
          'smartqueue_user',
          JSON.stringify(result)
        )


        return
      }


      // ==================================================
      // CUSTOMER LOGIN
      // ==================================================

      if (
        result.role === 'USER' ||
        result.role === null ||
        result.role === undefined
      ) {

        setCurrentUser(result)

        setIsAdmin(false)

        setIsLoggedIn(true)

        setMessage(
          'Login successful'
        )


        localStorage.setItem(
          'smartqueue_loggedIn',
          'true'
        )


        localStorage.setItem(
          'smartqueue_user',
          JSON.stringify(result)
        )


        // Restore saved token

        const savedToken =
          localStorage.getItem(
            'smartqueue_token'
          )


        if (savedToken) {

          try {

            const savedTokenData =
              JSON.parse(savedToken)


            const tokenResponse =
              await fetch(
                `${API_URL}/api/token/${savedTokenData.tokenNumber}/${result.id}`
              )


            if (tokenResponse.ok) {

              const latestToken =
                await tokenResponse.json()


              setToken(latestToken)


              localStorage.setItem(
                'smartqueue_token',
                JSON.stringify(latestToken)
              )


              if (
                latestToken.status ===
                'WAITING'
              ) {

                const peopleResponse =
                  await fetch(
                    `${API_URL}/api/queue/people-ahead/${latestToken.tokenNumber}`
                  )


                if (
                  peopleResponse.ok
                ) {

                  const peopleCount =
                    await peopleResponse.json()


                  setPeopleAhead(
                    peopleCount
                  )


                  localStorage.setItem(
                    'smartqueue_peopleAhead',
                    peopleCount.toString()
                  )
                }

              } else {

                setPeopleAhead(0)

                localStorage.setItem(
                  'smartqueue_peopleAhead',
                  '0'
                )

              }

            }

          } catch (error) {

            console.log(
              'Failed to restore saved token'
            )

          }

        }


        return
      }


      // ==================================================
      // INVALID ROLE
      // ==================================================

      setMessage(
        'Invalid email or password'
      )


    } catch (error) {

      setMessage(
        'Backend server is not running'
      )

    }
  }


  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/register`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              rationCardNo:
                rationCardNo,

              userName:
                userName,

              phone:
                phone,

              familyMembers:
                Number(familyMembers),

              address:
                address,

              email:
                email,

              password:
                password

            })
          }
        )


      const result =
        await response.text()


      setMessage(result)


      if (
        result ===
        'Registration successful'
      ) {

        setRationCardNo('')

        setUserName('')

        setPhone('')

        setFamilyMembers('')

        setAddress('')

        setEmail('')

        setPassword('')

        setIsRegister(false)

      }


    } catch (error) {

      setMessage(
        'Backend server is not running'
      )

    }
  }


  // ==================================================
  // GET WAITING TOKENS
  // ==================================================

  const getWaitingTokens = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/queue/waiting`
        )


      if (response.ok) {

        const data =
          await response.json()

        setWaitingTokens(data)

      }

    } catch (error) {

      console.log(
        'Failed to load waiting tokens'
      )

    }
  }


  // ==================================================
  // GET SERVING TOKENS
  // ==================================================

  const getServingTokens = async () => {

    try {

      const response =
        await fetch(
          `${API_URL}/api/queue/serving`
        )


      if (response.ok) {

        const data =
          await response.json()

        setServingTokens(data)

      }

    } catch (error) {

      console.log(
        'Failed to load serving tokens'
      )

    }
  }


  // ==================================================
  // GET TOKEN HISTORY
  // ==================================================

  const getTokenHistory = async () => {

    if (!currentUser) {
      return
    }

    try {

      const response =
        await fetch(
          `${API_URL}/api/token/history/${currentUser.id}`
        )


      if (response.ok) {

        const data =
          await response.json()

        setTokenHistory(data)

        setShowHistory(true)

      } else {

        setMessage(
          'Failed to load token history'
        )

      }

    } catch (error) {

      setMessage(
        'Backend server is not running'
      )

    }
  }


  // ==================================================
  // UPDATE TOKEN STATUS
  // ==================================================

  const updateTokenStatus =
    async (
      tokenNumber,
      status
    ) => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/token/${tokenNumber}/status?status=${status}`,
            {
              method: 'PUT'
            }
          )


        const result =
          await response.text()


        if (response.ok) {

          setMessage(result)

          getWaitingTokens()

          getServingTokens()


          if (
            token &&
            token.tokenNumber ===
            tokenNumber &&
            currentUser
          ) {

            const updatedTokenResponse =
              await fetch(
                `${API_URL}/api/token/${tokenNumber}/${currentUser.id}`
              )


            if (
              updatedTokenResponse.ok
            ) {

              const updatedToken =
                await updatedTokenResponse.json()


              setToken(updatedToken)


              localStorage.setItem(
                'smartqueue_token',
                JSON.stringify(updatedToken)
              )


              if (
                updatedToken.status ===
                'WAITING'
              ) {

                const peopleResponse =
                  await fetch(
                    `${API_URL}/api/queue/people-ahead/${tokenNumber}`
                  )


                if (
                  peopleResponse.ok
                ) {

                  const peopleCount =
                    await peopleResponse.json()


                  setPeopleAhead(
                    peopleCount
                  )


                  localStorage.setItem(
                    'smartqueue_peopleAhead',
                    peopleCount.toString()
                  )

                }

              } else {

                setPeopleAhead(0)

                localStorage.setItem(
                  'smartqueue_peopleAhead',
                  '0'
                )

              }

            }

          }

        } else {

          setMessage(
            'Status update failed'
          )

        }

      } catch (error) {

        setMessage(
          'Backend server is not running'
        )

      }

    }


  // ==================================================
  // GET TOKEN
  // ==================================================

  const handleGetToken = async () => {

    if (!currentUser) {

      setMessage(
        'User details not available'
      )

      return
    }


    try {

      const response =
        await fetch(
          `${API_URL}/api/token`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              userId:
                currentUser.id,

              queueId: 1

            })

          }
        )


      if (!response.ok) {

        setMessage(
          'Token generation failed'
        )

        return
      }


      const tokenData =
        await response.json()


      const peopleResponse =
        await fetch(
          `${API_URL}/api/queue/people-ahead/${tokenData.tokenNumber}`
        )


      const peopleCount =
        await peopleResponse.json()


      setPeopleAhead(
        peopleCount
      )


      setToken(
        tokenData
      )


      setMessage(
        'Token generated successfully'
      )


      localStorage.setItem(
        'smartqueue_token',
        JSON.stringify(tokenData)
      )


      localStorage.setItem(
        'smartqueue_peopleAhead',
        peopleCount.toString()
      )


    } catch (error) {

      setMessage(
        'Backend server is not running'
      )

    }
  }


  // ==================================================
  // AUTO UPDATE CUSTOMER TOKEN
  // ==================================================

  useEffect(() => {

    if (
      !isLoggedIn ||
      isAdmin ||
      !token ||
      !currentUser
    ) {

      return
    }


    const checkTokenStatus =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/api/token/${token.tokenNumber}/${currentUser.id}`
            )


          if (response.ok) {

            const updatedToken =
              await response.json()


            setToken(
              updatedToken
            )


            localStorage.setItem(
              'smartqueue_token',
              JSON.stringify(updatedToken)
            )


            if (
              updatedToken.status ===
              'WAITING'
            ) {

              const peopleResponse =
                await fetch(
                  `${API_URL}/api/queue/people-ahead/${updatedToken.tokenNumber}`
                )


              if (
                peopleResponse.ok
              ) {

                const peopleCount =
                  await peopleResponse.json()


                setPeopleAhead(
                  peopleCount
                )


                localStorage.setItem(
                  'smartqueue_peopleAhead',
                  peopleCount.toString()
                )

              }

            } else {

              setPeopleAhead(0)

              localStorage.setItem(
                'smartqueue_peopleAhead',
                '0'
              )

            }

          }

        } catch (error) {

          console.log(
            'Failed to update token status'
          )

        }

      }


    checkTokenStatus()


    const interval =
      setInterval(
        checkTokenStatus,
        3000
      )


    return () => {

      clearInterval(
        interval
      )

    }

  }, [
    isLoggedIn,
    isAdmin,
    token?.tokenNumber,
    currentUser?.id
  ])


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {

    setIsLoggedIn(false)

    setIsAdmin(false)

    setCurrentUser(null)

    setToken(null)

    setPeopleAhead(null)

    setTokenHistory([])

    setShowHistory(false)

    setMessage('')

    setEmail('')

    setPassword('')


    localStorage.removeItem(
      'smartqueue_loggedIn'
    )

    localStorage.removeItem(
      'smartqueue_user'
    )

    localStorage.removeItem(
      'smartqueue_token'
    )

    localStorage.removeItem(
      'smartqueue_peopleAhead'
    )

  }


  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  if (isAdmin) {

    return (

      <div className="login-page">

        <div className="login-box">

          <h1 className="smart-queue-title">
            Smart<br />
            Queue
          </h1>


          <p>
            Ration Shop Management System
          </p>


          <h2>
            Admin Dashboard
          </h2>


          <button
            onClick={
              getWaitingTokens
            }
          >
            View Waiting Queue
          </button>


          <h3>
            Currently Serving
          </h3>


          {
            servingTokens.length === 0 ? (

              <p>
                No token is currently serving
              </p>

            ) : (

              servingTokens.map(
                (item) => (

                  <div
                    key={
                      item.tokenId
                    }
                  >

                    <p>
                      Token {
                        item.tokenNumber
                      } - {
                        item.status
                      }
                    </p>


                    <button
                      onClick={() =>
                        updateTokenStatus(
                          item.tokenNumber,
                          'COMPLETED'
                        )
                      }
                    >
                      COMPLETED
                    </button>

                  </div>

                )
              )

            )
          }


          <h3>
            Current Queue
          </h3>


          {
            waitingTokens.length === 0 ? (

              <p>
                No waiting tokens
              </p>

            ) : (

              waitingTokens.map(
                (item) => (

                  <div
                    key={
                      item.tokenId
                    }
                  >

                    <p>
                      Token {
                        item.tokenNumber
                      } - {
                        item.status
                      }
                    </p>


                    <button
                      onClick={() =>
                        updateTokenStatus(
                          item.tokenNumber,
                          'SERVING'
                        )
                      }
                    >
                      SERVING
                    </button>


                    <button
                      onClick={() =>
                        updateTokenStatus(
                          item.tokenNumber,
                          'COMPLETED'
                        )
                      }
                    >
                      COMPLETED
                    </button>

                  </div>

                )
              )

            )
          }


          <button
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </div>

    )

  }


  // ==================================================
  // CUSTOMER DASHBOARD
  // ==================================================

  if (isLoggedIn) {

    return (

      <div className="login-page">

        <div className="login-box">

          <h1 className="smart-queue-title">
            Smart<br />
            Queue
          </h1>


          <p>
            Ration Shop Management System
          </p>


          <h2>
            Welcome!
          </h2>


          <p>
            <strong>
              {currentUser?.userName}
            </strong>
          </p>


          <p>
            {message}
          </p>


          {
            !token && (

              <button
                onClick={
                  handleGetToken
                }
              >
                Get Token
              </button>

            )
          }


          {
            token && (

              <div className="queue-progress">

                <div className="token-card">

                  <span>
                    Your Token
                  </span>

                  <h1>
                    {token.tokenNumber}
                  </h1>

                </div>


                <div className="queue-status">

                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      token.status ===
                      'SERVING'
                        ? 'status-serving'
                        : token.status ===
                          'COMPLETED'
                          ? 'status-completed'
                          : 'status-waiting'
                    }
                  >
                    {token.status}
                  </strong>

                </div>


                <div className="queue-info">

                  <div className="info-item">

                    <span>
                      Issue Date
                    </span>

                    <strong>
                      {token.issueDate}
                    </strong>

                  </div>


                  <div className="info-item">

                    <span>
                      People Ahead
                    </span>

                    <strong>
                      {peopleAhead}
                    </strong>

                  </div>


                  <div className="info-item">

                    <span>
                      Waiting Time
                    </span>

                    <strong>
                      {getWaitingTime()}
                    </strong>

                  </div>

                </div>


                <div className="queue-progress-message">

                  {
                    token.status ===
                    'SERVING'
                      ? 'Your turn is now! 🎉'
                      : token.status ===
                        'COMPLETED'
                        ? 'Your token is completed.'
                        : 'Please wait for your turn.'
                  }

                </div>

              </div>

            )
          }


          {/* TOKEN HISTORY */}

          <button
            onClick={() => {

              if (showHistory) {
                setShowHistory(false)
              } else {
                getTokenHistory()
              }

            }}
          >
            {
              showHistory
                ? 'Hide Token History'
                : 'View Token History'
            }
          </button>


          {
            showHistory && (

              <div className="token-history">

                <h3>
                  Token History
                </h3>


                {
                  tokenHistory.length === 0 ? (

                    <p>
                      No token history found
                    </p>

                  ) : (

                    tokenHistory.map(
                      (item) => (

                        <div
                          key={
                            item.tokenId
                          }
                          className="history-item"
                        >

                          <p>
                            <strong>
                              Token {item.tokenNumber}
                            </strong>
                          </p>

                          <p>
                            Date: {item.issueDate}
                          </p>

                          <p>
                            Status: {item.status}
                          </p>

                        </div>

                      )
                    )

                  )
                }

              </div>

            )

          }


          <button
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </div>

    )

  }


  // ==================================================
  // LOGIN / REGISTER PAGE
  // ==================================================

  return (

    <div className="login-page">

      <div className="login-box">

        <h1 className="smart-queue-title">
          Smart<br />
          Queue
        </h1>


        <p>
          Ration Shop Management System
        </p>


        {
          isRegister ? (

            <>

              <h2>
                Register
              </h2>


              <input
                type="text"
                placeholder="Ration Card Number"
                value={rationCardNo}
                onChange={(e) =>
                  setRationCardNo(
                    e.target.value
                  )
                }
              />


              <input
                type="text"
                placeholder="User Name"
                value={userName}
                onChange={(e) =>
                  setUserName(
                    e.target.value
                  )
                }
              />


              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
              />


              <input
                type="number"
                placeholder="Family Members"
                value={familyMembers}
                onChange={(e) =>
                  setFamilyMembers(
                    e.target.value
                  )
                }
              />


              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />


              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />


              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />


              <button
                onClick={
                  handleRegister
                }
              >
                Register
              </button>


              <p>
                {message}
              </p>


              <p
                className="register"
                onClick={() => {

                  setIsRegister(
                    false
                  )

                  setMessage('')

                }}
              >
                Already have an account?
                Login
              </p>

            </>

          ) : (

            <>

              <h2>
                Login
              </h2>


              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />


              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />


              <button
                onClick={
                  handleLogin
                }
              >
                Login
              </button>


              <p>
                {message}
              </p>


              <p
                className="register"
                onClick={() => {

                  setIsRegister(
                    true
                  )

                  setMessage('')

                }}
              >
                New User?
                Register here
              </p>

            </>

          )
        }

      </div>

    </div>

  )

}

export default App