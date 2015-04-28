package com.cedarsoftware.nails.util

import com.cedarsoftware.ncube.JdbcConnectionProvider
import groovy.transform.CompileStatic
import org.springframework.jdbc.datasource.DataSourceUtils

import javax.sql.DataSource
import java.sql.Connection

/**
 * Spring Transaction Based JDBC Connection Provider
 *
 * @author Ken Partlow
 *         <br/>
 *         Copyright (c) Cedar Software LLC
 *         <br/><br/>
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *         <br/><br/>
 *         http://www.apache.org/licenses/LICENSE-2.0
 *         <br/><br/>
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */
@CompileStatic
class SpringConnectionProvider implements JdbcConnectionProvider
{
    DataSource dataSource

    SpringConnectionProvider(DataSource dataSource)
    {
        this.dataSource = dataSource
    }

    Connection getConnection()
    {
        return DataSourceUtils.getConnection(dataSource)
    }

    void releaseConnection(Connection c)
    {
        DataSourceUtils.releaseConnection(c, dataSource)
    }
}
