const User = require('../../models/User');
const fs = require('fs');  
const path = require('path');  
const bcrypt = require('bcryptjs');

const index = async (req, res) => {
    const user = await User.findById(req.session.user._id);
    
    // Ako nema slike u bazi, postavi default
    if (!user.profileImage) {  
        user.profileImage = '/uploads/profiles/default.png';
        await user.save(); 
    }
    
    // Proveri da li fajl postoji u folderu uploads/profiles
    const imagePath = path.join(__dirname, '../../public', user.profileImage);
    if (!fs.existsSync(imagePath)) {
        user.profileImage = '/uploads/profiles/default.png';
        await user.save();
    }
    
    req.session.user.profileImage = user.profileImage; 
    
    req.session.save((err) => {  
        if (err) console.error('Greška pri čuvanju sessiona:', err);
        res.render('admin/profile/index', { user, title: 'Profile' });
    });
};

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/admin/profile');
        }
        
        const user = await User.findById(req.session.user._id);
        
        // Obriši stari fajl (samo ako nije default slika)
        if (user.profileImage && user.profileImage !== '/uploads/profiles/default.png') {
            const oldImagePath = path.join(__dirname, '../../public', user.profileImage);
            
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Sačuvamo path u bazi
        const imagePath = '/uploads/profiles/' + req.file.filename;
        user.profileImage = imagePath;
        await user.save();
        
        // Ažuriramo session
        req.session.user.profileImage = imagePath;
        
        req.session.save((err) => {
            if (err) console.error('Greška pri čuvanju sessiona:', err);
        });
        
        res.redirect('/admin/profile');
    } catch (error) {
        console.error('Upload error:', error);
        
        // Multer error handling
        if (error instanceof Error && error.name === 'MulterError') {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.redirect('/admin/profile?error=Fajl je prevelik. Maksimalna veličina je 5MB.');
            }
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.redirect('/admin/profile?error=Neočekivan fajl. Proverite naziv input polja.');
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
                return res.redirect('/admin/profile?error=Previše fajlova. Dozvoljeno je najviše 10 slika.');
            }
        }
        
        // File type error
        if (error instanceof Error && error.message.includes('file type')) {
            return res.redirect('/admin/profile?error=Dozvoljeni su samo slikovni formati: JPEG, PNG, GIF, WebP');
        }
        
        res.redirect('/admin/profile?error=Greška pri upload-u fajla');
    }
};


// GET: Prikaži edit formu
const showEdit = async (req, res) => {
    // const user = await User.findById(req.session.user._id);
    res.render('admin/profile/edit', { 
        user: req.session.user,
        title: 'Edit Profile',
        error: null,
        errorUsername: null,
        errorEmail: null,
        errorNovaSifra: null,
        errorPoklapanjeSifri: null,
        errorPrekratkaSifra: null,
        errorNovaSifraNijeRazlicita: null
    });
};

// POST: Ažuriraj profile
const update = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            newPassword, 
            confirmNewPassword, 
            currentEmail, 
            currentPassword 
        } = req.body;

        // Validacija obaveznih polja (za sigurnosnu proveru)
        if (!currentEmail || !currentPassword) {
            return res.render('admin/profile/edit', { 
                user: req.session.user, 
                title: 'Edit Profile', 
                error: 'Trenutni email i šifra su obavezni!', 
                errorUsername: null,
                errorEmail: null,
                errorNovaSifra: null,
                errorPoklapanjeSifri: null, 
                errorPrekratkaSifra: null,
                errorNovaSifraNijeRazlicita: null
            });
        }

        const user = await User.findById(req.session.user._id);

        // SIGURNOSNA PROVERA 1: Trenutni email
        if (user.email !== currentEmail) {
            return res.render('admin/profile/edit', { 
                user: req.session.user, 
                title: 'Edit Profile', 
                error: 'Trenutni email ili password se ne poklapaju!', 
                errorUsername: null,
                errorEmail: null,
                errorNovaSifra: null,
                errorPoklapanjeSifri: null,
                errorPrekratkaSifra: null,
                errorNovaSifraNijeRazlicita: null
            });
        }

        // SIGURNOSNA PROVERA 2: Trenutna šifra
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.render('admin/profile/edit', { 
                user: req.session.user, 
                title: 'Edit Profile', 
                error: 'Trenutni email ili password se ne poklapaju!', 
                errorUsername: null,
                errorEmail: null,
                errorNovaSifra: null,
                errorPoklapanjeSifri: null,
                errorPrekratkaSifra: null,
                errorNovaSifraNijeRazlicita: null
            });
        }

        // Ako je prošla sigurnosna provera, nastavi sa ažuriranjem

        // AŽURIRANJE USERNAME-A
        if (username && username !== user.username) {
            if (username.length < 3 || username.length > 20) {
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: 'Username mora imati između 3 i 20 karaktera!' ,
                    errorEmail: null,
                    errorNovaSifra: null,
                    errorPoklapanjeSifri: null,
                    errorPrekratkaSifra: null,
                    errorNovaSifraNijeRazlicita: null
                });
            }
            user.username = username;
            req.session.user.username = username;
        }

        // AŽURIRANJE EMAIL-A
        if (email && email !== user.email) {
            // Proveri da li novi email već postoji u bazi(osim za trenutnog korisnika)
            const existingUser = await User.findOne({ 
                email: email, 
                _id: { $ne: user._id } 
            });
            if (existingUser) {
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: null,
                    errorEmail: 'Email već postoji u bazi!',
                    errorNovaSifra: null,
                    errorPoklapanjeSifri: null,
                    errorPrekratkaSifra: null,
                    errorNovaSifraNijeRazlicita: null
                });
            }
            user.email = email;
            req.session.user.email = email;
        }

        // AŽURIRANJE ŠIFRE (opciono)
        if (newPassword) {
            // Proveri da li su obe nove šifre unete
            if (!confirmNewPassword) {
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: null,
                    errorEmail: null,
                    errorNovaSifra: 'Potvrdi novu šifru!',
                    errorPoklapanjeSifri: null,
                    errorPrekratkaSifra: null,
                    errorNovaSifraNijeRazlicita: null
                });
            }

            // Proveri da li se nove šifre poklapaju
            if (newPassword !== confirmNewPassword) {
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: null,
                    errorEmail: null,
                    errorNovaSifra: null,
                    errorPoklapanjeSifri: 'Nove šifre se ne poklapaju!',
                    errorPrekratkaSifra: null,
                    errorNovaSifraNijeRazlicita: null
                });
            }

            // Validacija dužine
            if (newPassword.length < 5) {   // Ograniciti duzinu sifre u bazi podataka
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: null,
                    errorEmail: null,
                    errorNovaSifra: null,
                    errorPoklapanjeSifri: null,
                    errorPrekratkaSifra: 'Nova šifra mora imati najmanje 5 karaktera!',
                    errorNovaSifraNijeRazlicita: null
                });
            }

            // Ne dozvoli istu šifru kao trenutna
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.render('admin/profile/edit', { 
                    user: req.session.user, 
                    title: 'Edit Profile', 
                    error: null,
                    errorUsername: null,
                    errorEmail: null,
                    errorNovaSifra: null,
                    errorPoklapanjeSifri: null,
                    errorPrekratkaSifra: null,
                    errorNovaSifraNijeRazlicita: 'Nova šifra mora biti različita od trenutne!'
                });
            }

            // Hash nova šifra
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Sačuvaj sve izmene sa const user = await User.findById(req.session.user._id);    
        await user.save();  // obzirom da je user(koji je mongoose objekat) već učitan, pozivamo save() da sačuvamo sve promene odjednom u bazi

        req.session.save((err) => {
            if (err) {
                console.error('Greška pri čuvanju sessiona:', err);
                return res.redirect('/admin/profile/edit'); // redirect inside the callback to ensure it happens after the session is saved
            }
            console.log('Profil uspešno ažuriran');
            res.redirect('/admin/profile');
        });

    } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
        res.redirect('/admin/profile/edit');
    }
};

module.exports = { 
    index, 
    uploadImage,
    showEdit,
    update
};