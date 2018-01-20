import * as Acl from 'acl';
import {NextFunction, Request, Response} from 'express';
import {User} from '../../Users/models/user.model';

// Using the memory backend
let acl = new Acl(new Acl.memoryBackend());

/**
 * Invoke System logs Permissions
 */
export function invokeRolesPolicies() {
  acl.allow([{
    roles: ['guest'],
    allows: [{
      resources: '/api/posts',
      permissions: '*'
    }, {
      resources: '/api/posts/:id',
      permissions: '*'
    }]
  }]);
};

/**
 * Check If System logs Policy Allows
 */
export function isAllowed(req: Request, res: Response, next: NextFunction) {
  const roles = (req.user) ? (<User>req.user).roles.map(role => role.name) : ['guest'];

  console.log(roles);

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
