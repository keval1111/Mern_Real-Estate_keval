const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_realestate_jwt_key_2026', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, addresses, panOrTaxId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
    }

    const assignedRole = role || 'Sub-Admin';
    const permissions = assignedRole === 'Super Admin'
      ? 'Full Access'
      : assignedRole === 'Sub-Admin'
      ? 'Manage Properties & Bookings'
      : assignedRole === 'Staff'
      ? 'Selected Sections'
      : 'Customer Portal';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone || '',
      panOrTaxId: panOrTaxId || '',
      role: assignedRole,
      permissions,
      kycStatus: 'Not_Submitted',
      addresses: Array.isArray(addresses) && addresses.length > 0 ? addresses : [
        {
          id: `addr-${Date.now()}`,
          isDefault: true,
          type: 'Primary Residence',
          fullName: name.trim(),
          phone: phone || '',
          street: '742 Evergreen Terrace, Palm Boulevard',
          city: 'Springfield',
          state: 'Oregon',
          pincode: '97477',
          country: 'United States',
        }
      ],
    });

    // Notify Super Admin if a Sub-Admin registers
    if (assignedRole === 'Sub-Admin' || assignedRole === 'Staff' || assignedRole === 'Property Editor') {
      try {
        const notif = await Notification.create({
          recipientRole: 'Super Admin',
          senderId: user._id,
          senderName: user.name,
          type: 'subadmin_registered',
          title: 'New Sub-Admin Registered',
          message: `${user.name} (${user.email}) has registered as a ${assignedRole}. KYC verification pending.`,
          link: '/sub-admins',
          data: { userId: user._id, email: user.email, role: user.role }
        });

        const io = req.app.get('io');
        if (io) {
          io.emit('new_notification', notif);
          io.emit('new_subadmin_registration', {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          });
        }
      } catch (err) {
        console.warn('Notification creation error on sub-admin registration:', err.message);
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
        accessPermissions: user.accessPermissions || {},
        kycStatus: user.kycStatus || 'Not_Submitted',
        kycDetails: user.kycDetails || {},
        addresses: user.addresses,
        panOrTaxId: user.panOrTaxId,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Auto-seed default Super Admin if database has no accounts yet
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial Super Admin account (admin@realestate.com / admin123)...');
      await User.create({
        name: 'Administrator',
        email: 'admin@realestate.com',
        password: 'admin123',
        role: 'Super Admin',
        permissions: 'Full Access',
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
          accessPermissions: user.accessPermissions || {},
          kycStatus: user.kycStatus || 'Not_Submitted',
          kycDetails: user.kycDetails || {},
          addresses: user.addresses || [],
          panOrTaxId: user.panOrTaxId || '',
          token,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, panOrTaxId, aadhaarNumber, avatar } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (panOrTaxId !== undefined) user.panOrTaxId = panOrTaxId.trim();
    if (aadhaarNumber !== undefined) user.aadhaarNumber = aadhaarNumber.trim();
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        panOrTaxId: updatedUser.panOrTaxId,
        aadhaarNumber: updatedUser.aadhaarNumber,
        addresses: updatedUser.addresses,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { addresses } = req.body;
    if (Array.isArray(addresses)) {
      user.addresses = addresses;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Addresses updated successfully',
      data: user.addresses,
    });
  } catch (error) {
    console.error('Update addresses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
