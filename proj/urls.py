from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^', include('web_pconsfold.urls', namespace='web_pconsfold')),
    url(r'^$', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^help/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^news/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^reference/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^download/', include('web_pconsfold.urls', namespace='web_pconsfold')),
    # url(r'^blog/', include('blog.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
