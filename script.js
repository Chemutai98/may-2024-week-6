document.addEventListener('DOMContentLoaded', () =>{
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', async (event) =>{
        event.preventDefault();

//capture form data
        const formData = new FormData(registerForm); 
        const full_name = formData.get('full_name'); 
        const username = formData.get('username');  
        const email = formData.get('email'); 
        const password = formData.get('password'); 

    try{
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ full_name, username, email, password })
        });

        if(response.ok){
             alert('Registration successful')
        }else{
            alert('Registration failed')
        }
    }catch(error){
        console.error('Error occured: ', error);

    }
});


loginForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             const formData = new FormData(loginForm);
             const username = formData.get('username');
             const password = formData.get('password');
             try {
                 const response = await fetch('/login', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({ username, password })
                 });
                 if (response.ok) {
                     alert('Login successful');
                 } else {
                     alert('Invalid username or password');
                 }
             } catch (error) {
                 console.error('Error:', error);
             }
         });
     });
    
    