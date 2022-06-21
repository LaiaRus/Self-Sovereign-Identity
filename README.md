# Description

This is a very simple Self-Sovereign-Identity (SSI) system in which a user with a [Distributed Identifier](https://www.w3.org/TR/did-core/) (DID) can request a [Verifiable Credential](https://www.w3.org/TR/vc-data-model/) (VC) in order to guarantee a [Selective Disclosure](https://www.w3.org/TR/vc-imp-guide/#selective-disclosure) (SD).

To put it in context, the system deals with a student who has a DID and who asks a university to issue student credentials to be able to generate a [Verifiable Presentation](https://www.w3.org/TR/vc-data-model/#dfn-verifiable-presentations) (VP) to access external services, such as the gym, the library, and the café.

This repository contains three projects: 
- The React application
- The University’s Express API
- The Gym’s Express API


# Getting Started

Download all dependencies with npm:

```console
$ npm install
````

Execute every project:

- React application:

```console
$ npm start
```

- University's Express API:
```console
$ node .\server_mu.js
```

- Gym's Express API:
```console
$ node .\server_gym.js
```

localhost:3000 should open automatically on your default browser.

# Usage

## Step #1
Sign in the university's webpage using the following credentials:

Username: *mike*

Password: *ILoveCelia*

## Step #2

Get a VC by clicking on the button *GET ANONYMOUS STUDENT CREDENTIAL*. It will be stored in the local storage of your browser.

## Step #3

Click on *MONSTERS GYM* button. You will be redirected to their page after following the [SSI protocol](https://github.com/LaiaRus/Self-Sovereign-Identity#ssi-protocol) automatically.

# SSI Protocol

The scenario is composed by the following subjects:
- The university is called **Monsters University**. As it represents the trusted [issuer](https://www.w3.org/TR/vc-imp-guide/#terminology), it is responsible for the delivery of an anonymous credential (a VC) for every logged in student that requests for it. It declares the following **three claims**:
    - That the person who owns the VC is a student
    - That the university where this student studies is called Monsters University
    - And that it has not expired yet, since it becomes obsolete in 2022-08-01. 
- **Mike** is an enrolled student in Monsters University. His username is *mike* and his password is *ILoveCelia*. He is the one generating his VP.
- **Monsters Gym** is a service provided by Monsters University. Enrolled students have the right to access this website if their VP has been verified by Monsters Gym’s server.


For Mike to be able to access Gym service, he must demonstrate that he is a student at Monsters University. As all students at this university have an account for its webpage, Mike logs in there with his username and password. 

Monsters University’s server already has a Selective Disclosure whose claims are that the user that asks for a VC is currently a student at this university.

Mike does not notice it, but when he asks for a VC by clicking on a button, the client-site of the application generates a DID automatically for him and stores it in the local storage of his browser (not only the DID value is stored, but also its public and private keys. For security, this information is encrypted). 
> For the sake of simplicity, DID's information is stored in the browser local storage, but ideally it should be used a cryptographic wallet. 

After receiving the VC, the client’s JavaScript automatically verifies that the VC is correct by checking the following:
- That the issuer of the VC equals to Monsters University’s DID
- That the subject of the VC is Mike’s DID
- And that it claims that Mike is a student, and that the VC has not expired yet.

The VP stores the same three claims as Monsters University’s Selective Disclosure, and it is sent to Monsters Gym’s server.

Then, Monsters Gym’s server verifies the following:
- That Mike’s DID equals to the subject of the VP
- That Mike is a student
- That the university where Mike studies is called Monsters University
- That Mike’s credential has not expired yet

If everything is alight, Monsters Gym’s server redirects Mike to its web service.
