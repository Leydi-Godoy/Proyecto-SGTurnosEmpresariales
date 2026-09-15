/**
 * Role-based access control middleware
 * Checks if user has required role(s)
 */
function requireRole(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const userRole = parseInt(req.user.Id_rol);
		
		if (!allowedRoles.includes(userRole)) {
			const roleNames = {
				1: 'Super Admin',
				2: 'Admin Empresa',
				3: 'Planificador',
				4: 'Supervisor',
				5: 'Empleado'
			};
			
			const allowedNames = allowedRoles.map(r => roleNames[r] || `Role ${r}`).join(', ');
			return res.status(403).json({ 
				error: 'Forbidden',
				message: `Required roles: ${allowedNames}. Your role: ${roleNames[userRole] || 'Unknown'}` 
			});
		}

		next();
	};
}

/**
 * Company access check middleware
 * Ensures user can only access their own company (unless Super Admin)
 */
function requireCompanyAccess(req, res, next) {
	const userRole = parseInt(req.user.Id_rol);
	const userCompany = req.user.empresa_id;
	
	// Super Admin can access anything
	if (userRole === 1) {
		return next();
	}

	// Get company_id from request (try multiple locations)
	const requestCompany = 
		req.body?.empresa_id || 
		req.query?.empresa_id || 
		req.params?.empresa_id;

	// If no company specified, assume user's company
	if (!requestCompany || requestCompany == userCompany) {
		return next();
	}

	return res.status(403).json({ 
		error: 'Forbidden',
		message: 'Cannot access other companies' 
	});
}

module.exports = {
	requireRole,
	requireCompanyAccess
};
