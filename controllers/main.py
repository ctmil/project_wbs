# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from openerp import SUPERUSER_ID
from openerp import http
from openerp.http import request
import werkzeug
import datetime
import time

from openerp.tools.translate import _
from openerp.addons.website_mail.controllers.main import _message_post_helper


class project_project(http.Controller):
	@http.route("/project/<int:project_id>", type='http', auth="user", website=True)
	def view_project(self, *args, **kwargs):
        	#return self.view(*args, **kwargs)
		project_id = kwargs.get('project_id',None)
		if project_id:
			return self.view(project_id)
			



	@http.route("/project/<int:project_id>/<token>", type='http', auth="public", website=True)
	def view(self, project_id, pdf=None, token=None, message=False, **post):
	        # use SUPERUSER_ID allow to access/view order for public user
	        # only if he knows the private token
		project = request.registry['project.project'].browse(request.cr, SUPERUSER_ID, project_id)
	        values = {
			'project': project
	        }
	        return request.website.render('project_wbs.project_wbs', values)

	@http.route("/project/<int:project_id>/json", type='json', auth="none")
	def view_project_json(self,*args,**kwargs):
		project_id = kwargs.get('project_id',None)
		if project_id:
			records = request.env['project.project'].sudo().search([('id','=',project_id)])
			return records.read(['name'])
