# AFK Gmail Auto Replier 

This project was created as an Assessment for OpeninApp to be done in 2.5 Hrs 
(*cough* *cough* took me 5 Hrs 🥲)

This is as the name Suggest an Auto Replier when you are on leave (AFK = Away From Keyboard)
Its made using the Free to Use Gmail API and Vanilla JS/ Node.JS

Tasklist


# Tasklist
## What should it do?
- [x] The app should check for new emails in a given Gmail ID
  * 🎐 You need to implement the “Login with google” API for this
- [x] The app should send replies to Emails that have no prior replies
      
  * 🎐 The app should identify and isolate the email threads in which no prior email has been sent by you. This means that the app should only reply to first time email threads sent by others to your mailbox.
  * The email that you send as a reply can have any content you’d like, it doesn’t matter.
- [x] The app should add a Label to the email and move the email to the label
  * 🎐 After sending the reply, the email should be tagged with a label in Gmail. Feel free to name the label anything. If the label is not created already, you’ll need to create it. 
  * Use Google’s APIs to accomplish this
- [x] The app should repeat this sequence of steps 1-3 in random intervals of 45 to 120 seconds
- [x] ✨**ENJOY**✨



# API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.


## Demo - YouTube

https://youtu.be/iTEyOS_BubY?si=Z3STRDsaH4I2xRCV


## Installation PreReqs


```bash
  >npm dotenv
```
    
```bash
  >nodejs
```

```bash
  >npm googleapis
```


```bash
  >npm readline
```