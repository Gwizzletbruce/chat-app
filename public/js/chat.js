

const socket = io() //called from socket-io js file in html page

//Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options Query Strings
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Autoscroll

const autoScroll = () => {
    // New Message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have we scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}



socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:mm")
        
    })
    
    $messages.insertAdjacentHTML("beforeend", html)
    autoScroll()
})

socket.on("locationMessage", (message, url) => {
    console.log(message)
    const locationHtml = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("HH:mm")

    })
    $messages.insertAdjacentHTML("beforeend", locationHtml)
    autoScroll()
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

document.querySelector("#message-form").addEventListener("submit", (e) => {
    
    e.preventDefault()
    //disable

    const message = e.target.elements.message.value
    
    socket.emit("sendMessage", message, (error) => {
        //enable
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log("Message Delivered")
    })

})

document.querySelector("#send-location").addEventListener("click", () => {
    
    
    
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }

    $locationButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords)

        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude

            

        }
        , () => {
           console.log("Location shared") 
        
            $locationButton.removeAttribute("disabled")
        })
        
    })
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})