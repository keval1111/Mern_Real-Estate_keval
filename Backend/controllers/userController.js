const User = require('../models/User');
const Order = require('../models/Order');

// Default initial demo seed users if database only has admin or 0 users
const seedInitialUsers = async () => {
  try {
    const existing = await User.find();
    // Ensure Super Admin exists
    const hasAdmin = existing.some((u) => u.email === 'admin@realestate.com' || u.role === 'Super Admin');
    if (!hasAdmin) {
      await User.create({
        name: 'Administrator',
        email: 'admin@realestate.com',
        password: 'admin123',
        role: 'Super Admin',
        permissions: 'Full Access',
        phone: '+91 98000-00001',
        status: 'Active',
      });
    }

    // If fewer than 3 users, add some initial customers and staff
    if (existing.length < 3) {
      const demoUsers = [
        {
          name: 'Rohit Verma',
          email: 'rohit.verma@estateadmin.com',
          password: 'staffpassword123',
          phone: '+91 98765-11223',
          role: 'Property Editor',
          permissions: 'Selected Sections',
          status: 'Active',
          addresses: [
            {
              id: `addr-1`,
              isDefault: true,
              type: 'Office',
              fullName: 'Rohit Verma',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
            },
          ],
        },
        {
          name: 'Aarav Mehta',
          email: 'aarav.mehta@gmail.com',
          password: 'customerpass123',
          phone: '+91 98201-44521',
          role: 'Customer',
          permissions: 'Customer Portal',
          status: 'Active',
          addresses: [
            {
              id: `addr-2`,
              isDefault: true,
              type: 'Home',
              fullName: 'Aarav Mehta',
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
            },
          ],
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@yahoo.com',
          password: 'customerpass123',
          phone: '+91 98450-88219',
          role: 'Customer',
          permissions: 'Customer Portal',
          status: 'Active',
          addresses: [
            {
              id: `addr-3`,
              isDefault: true,
              type: 'Home',
              fullName: 'Priya Sharma',
              city: 'Bangalore',
              state: 'Karnataka',
              country: 'India',
            },
          ],
        },
        {
          name: 'Vikram Singhania',
          email: 'vikram.singh@outlook.com',
          password: 'customerpass123',
          phone: '+91 98110-33445',
          role: 'Customer',
          permissions: 'Customer Portal',
          status: 'Active',
          addresses: [
            {
              id: `addr-4`,
              isDefault: true,
              type: 'Home',
              fullName: 'Vikram Singhania',
              city: 'New Delhi',
              state: 'Delhi',
              country: 'India',
            },
          ],
        },
      ];

      for (const u of demoUsers) {
        const found = await User.findOne({ email: u.email });
        if (!found) {
          await User.create(u);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let users = await User.find().select('-password').sort({ createdAt: -1 });

    if (!users || users.length <= 1) {
      await seedInitialUsers();
      users = await User.find().select('-password').sort({ createdAt: -1 });
    }

    // Attach order counts / total spent if available
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const uObj = u.toObject();
        try {
          const orders = await Order.find({ user: u._id });
          uObj.ordersCount = orders.length;
          uObj.totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || o.bookingFee || 0), 0);
        } catch {
          uObj.ordersCount = 0;
          uObj.totalSpent = 0;
        }
        return uObj;
      })
    );

    res.json({
      success: true,
      count: enrichedUsers.length,
      data: enrichedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, city, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const userRole = role || 'Customer';
    const permissions =
      userRole === 'Super Admin'
        ? 'Full Access'
        : ['Staff', 'Property Editor', 'Finance Admin'].includes(userRole)
        ? 'Selected Sections'
        : 'Customer Portal';

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password || 'Welcome@123',
      phone: phone || '',
      role: userRole,
      permissions,
      status: status || 'Active',
      addresses: city
        ? [
            {
              id: `addr-${Date.now()}`,
              isDefault: true,
              type: 'Home',
              fullName: name.trim(),
              city: city.trim(),
              country: 'India',
            },
          ]
        : [],
    });

    res.status(201).json({
      success: true,
      message: `${userRole} created successfully`,
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['Super Admin', 'Main Admin', 'Admin', 'Sub-Admin', 'Staff', 'Property Editor', 'Finance Admin', 'Customer'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    user.permissions =
      role === 'Super Admin'
        ? 'Full Access'
        : ['Staff', 'Property Editor', 'Finance Admin'].includes(role)
        ? 'Selected Sections'
        : 'Customer Portal';

    await user.save();

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Active', 'Inactive'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Active or Inactive' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User status changed to ${status}`,
      data: user,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    let user = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    } else {
      user = await User.findOne({ $or: [{ _id: id }, { email: id }] }).catch(() => null);
    }

    if (!user) {
      // User already removed or was in local storage only
      return res.json({
        success: true,
        message: 'User removed successfully',
        data: { id },
      });
    }

    // Prevent deleting primary Super Admin
    if (user.email === 'admin@realestate.com') {
      return res.status(403).json({ success: false, message: 'Primary Super Admin account cannot be deleted' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndDelete(id);
    } else {
      await User.deleteOne({ _id: user._id });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissions, accessPermissions } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (permissions !== undefined) user.permissions = permissions;
    if (accessPermissions && typeof accessPermissions === 'object') {
      const current = user.accessPermissions ? user.accessPermissions.toObject ? user.accessPermissions.toObject() : user.accessPermissions : {};
      user.accessPermissions = {
        ...current,
        ...accessPermissions,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Sub-Admin permissions updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

