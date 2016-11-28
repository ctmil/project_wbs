# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from openerp import SUPERUSER_ID
from openerp.addons.web import http
from openerp.addons.web.http import request
import werkzeug
import datetime
import time

from openerp.tools.translate import _
from openerp.addons.website_mail.controllers.main import _message_post_helper


class project_project(http.Controller):
	@http.route("/project/<int:project_id>", type='http', auth="user", website=True)
	def view_project(self, *args, **kwargs):
		import pdb;pdb.set_trace()
	        #return self.view(*args, **kwargs)
	        values = {
	        }

	        return request.website.render('project_wbs.project_wbs', values)


	@http.route("/project/<int:project_id>/<token>", type='http', auth="public", website=True)
	def view(self, order_id, pdf=None, token=None, message=False, **post):
	        # use SUPERUSER_ID allow to access/view order for public user
	        # only if he knows the private token
	        values = {
	        }

	        return request.website.render('project_wbs.project_wbs', values)

