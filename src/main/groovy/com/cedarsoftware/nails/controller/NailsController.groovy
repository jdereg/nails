package com.cedarsoftware.nails.controller

import com.cedarsoftware.nails.service.NailsService
import com.cedarsoftware.servlet.ControllerClass
import com.cedarsoftware.util.StringUtilities
import groovy.transform.CompileStatic
import org.codehaus.groovy.util.StringUtil

import java.security.SecureRandom

/**
 * @author John DeRegnaucourt
 */
@CompileStatic
@ControllerClass
class NailsController
{
    NailsService service
    Random random = new SecureRandom([1, 10, 100, 1000] as byte[])

    NailsController(NailsService nailsService)
    {
        service = nailsService
    }

    Object[] getList(String name)
    {
        List list = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', name]
        for (int i = 0; i < 3 + random.nextInt(20); i++)
        {
            list.add(StringUtilities.getRandomString(random, 4, 9))
        }
        Collections.sort(list)
        return list as Object[]
    }
}